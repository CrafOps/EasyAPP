import ffmpeg from 'fluent-ffmpeg'
import ffmpegStatic from 'ffmpeg-static'
import path from 'path'
import fs from 'fs'

export interface ConversionConfig {
  inputPaths: string[]
  outputDir: string
  prefix: string
  modid: string
  stream: boolean
  attenuationDistance: number
  /** สร้าง export_song_title.json (ชื่อที่แปลงแล้ว → ชื่อเพลงต้นฉบับ) */
  exportSongTitle?: boolean
  /** path ที่คั่นระหว่าง modid กับชื่อเสียงใน key เช่น "server/" */
  songTitlePath?: string
}

/** "server" | "/server/" | "server/" -> "server/", "" -> "" */
function normalizeKeyPath(p = ''): string {
  const trimmed = p.trim().replace(/\\/g, '/').replace(/^\/+|\/+$/g, '')
  return trimmed ? `${trimmed}/` : ''
}

const pathToFfmpeg = ffmpegStatic || ''
const ffmpegPath = pathToFfmpeg.replace('app.asar', 'app.asar.unpacked')
ffmpeg.setFfmpegPath(ffmpegPath)

function getAudioFiles(dir: string): string[] {
  let results: string[] = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results = results.concat(getAudioFiles(fullPath))
    } else if (['.wav', '.mp3', '.m4a', '.ogg'].includes(path.extname(entry.name).toLowerCase())) {
      results.push(fullPath)
    }
  }
  return results
}

// แปลงอักษรไทยเป็นอักษรละติน (แบบประมาณ อิง RTGS) เพราะ Minecraft รับได้แค่ a-z 0-9 _
const THAI_MAP: Record<string, string> = {
  ก: 'k', ข: 'kh', ฃ: 'kh', ค: 'kh', ฅ: 'kh', ฆ: 'kh', ง: 'ng', จ: 'ch', ฉ: 'ch', ช: 'ch',
  ซ: 's', ฌ: 'ch', ญ: 'y', ฎ: 'd', ฏ: 't', ฐ: 'th', ฑ: 'th', ฒ: 'th', ณ: 'n', ด: 'd',
  ต: 't', ถ: 'th', ท: 'th', ธ: 'th', น: 'n', บ: 'b', ป: 'p', ผ: 'ph', ฝ: 'f', พ: 'ph',
  ฟ: 'f', ภ: 'ph', ม: 'm', ย: 'y', ร: 'r', ฤ: 'rue', ล: 'l', ฦ: 'lue', ว: 'w', ศ: 's',
  ษ: 's', ส: 's', ห: 'h', ฬ: 'l', อ: 'o', ฮ: 'h',
  'ะ': 'a', 'ั': 'a', า: 'a', 'ำ': 'am', 'ิ': 'i', 'ี': 'i', 'ึ': 'ue', 'ื': 'ue', 'ุ': 'u',
  'ู': 'u', เ: 'e', แ: 'ae', โ: 'o', ใ: 'ai', ไ: 'ai',
  '๐': '0', '๑': '1', '๒': '2', '๓': '3', '๔': '4', '๕': '5', '๖': '6', '๗': '7', '๘': '8', '๙': '9'
}
const THAI_LEADING_VOWELS = new Set(['เ', 'แ', 'โ', 'ใ', 'ไ'])
const isThaiConsonant = (c: string): boolean => c >= 'ก' && c <= 'ฮ'

function transliterateThai(text: string): string {
  const out: string[] = []
  const chars = [...text]
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i]
    // สระหน้า (เ แ โ ใ ไ) เขียนก่อนพยัญชนะแต่ออกเสียงทีหลัง -> สลับลำดับ
    if (THAI_LEADING_VOWELS.has(c) && i + 1 < chars.length && isThaiConsonant(chars[i + 1])) {
      out.push(THAI_MAP[chars[i + 1]], THAI_MAP[c])
      i++
    } else if (c === '์') {
      out.pop() // การันต์: ไม่ออกเสียงตัวก่อนหน้า
    } else if (c in THAI_MAP) {
      out.push(THAI_MAP[c])
    } else if (c >= '฀' && c <= '๿') {
      // วรรณยุกต์ ไม้ไต่คู้ ๆ ฯ ฯลฯ -> ตัดทิ้ง
    } else {
      out.push(c)
    }
  }
  return out.join('')
}

function sanitizeFilename(filename: string): string {
  return transliterateThai(filename)
    .toLowerCase()
    .replace(/[,\s-]/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
}

export async function processAudio(
  config: ConversionConfig,
  onProgress: (msg: string) => void
): Promise<void> {
  const { inputPaths, outputDir, prefix, modid, stream, attenuationDistance } = config
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })
  const soundsDir = path.join(outputDir, 'sounds')
  if (!fs.existsSync(soundsDir)) fs.mkdirSync(soundsDir, { recursive: true })
  const allFiles = inputPaths.reduce((acc: string[], p: string) => {
    return acc.concat(fs.lstatSync(p).isDirectory() ? getAudioFiles(p) : [p])
  }, [])
  onProgress(`พบไฟล์เสียงทั้งหมด ${allFiles.length} ไฟล์`)

  let soundContent = ''
  let registerContent = ''
  let nameContent = ''

  // ตั้งชื่อให้ครบก่อน เพื่อกันชื่อซ้ำ (ไม่งั้นไฟล์จะทับกัน)
  const usedNames = new Set<string>()
  const finalNames = allFiles.map((inputFile, index) => {
    const baseName = sanitizeFilename(path.parse(inputFile).name) || `sound_${index + 1}`
    const candidate = prefix ? `${prefix}_${baseName}` : baseName
    let name = candidate
    for (let n = 2; usedNames.has(name); n++) name = `${candidate}_${n}`
    usedNames.add(name)
    return name
  })

  const converted: boolean[] = allFiles.map(() => false)

  await Promise.all(
    allFiles.map((inputFile, index) => {
      return new Promise<void>((resolve) => {
        const finalName = finalNames[index]
        const outputFile = path.join(soundsDir, `${finalName}.ogg`)

        ffmpeg.ffprobe(inputFile, (_err, metadata) => {
          const duration = metadata?.format?.duration || 0
          const tick = Math.round((duration + 5) * 20)

          ffmpeg(inputFile)
            .outputOption('-map', '0:a')
            .outputOption('-c:a', 'libvorbis')
            .outputOption('-ac', '1')
            .outputOption('-ar', '44100')
            .toFormat('ogg')
            .on('end', () => {
              soundContent += `"${finalName}": {
  "sounds": [
    {
      "name": "${modid}:${finalName}",
      "stream": ${stream},
      "attenuation_distance": ${attenuationDistance}
    }
  ]
},
`
              const constantName = finalName.toUpperCase()
              registerContent += `\tpublic static final SoundEvent ${constantName} = registerSoundEvent("${finalName}");\n`
              nameContent += `/playsound @s ${modid}:${finalName} master @s | Tick ${tick}\n`

              converted[index] = true
              onProgress(`เสร็จสิ้น: sounds/${finalName}.ogg`)
              resolve()
            })
            .on('error', (e) => {
              onProgress(`Error: ${e.message}`)
              resolve()
            })
            .save(outputFile)
        })
      })
    })
  )

  fs.writeFileSync(path.join(outputDir, 'sound.txt'), soundContent)
  fs.writeFileSync(path.join(outputDir, 'code_register.txt'), registerContent)
  fs.writeFileSync(path.join(outputDir, 'name_playsound.txt'), nameContent)

  if (config.exportSongTitle) {
    // เรียงตามลำดับไฟล์ต้นทาง (ไม่ใช่ลำดับที่แปลงเสร็จ) และใส่เฉพาะไฟล์ที่แปลงสำเร็จ
    const keyPath = normalizeKeyPath(config.songTitlePath)
    const titles: Record<string, string> = {}
    allFiles.forEach((inputFile, index) => {
      if (converted[index]) titles[`${modid}:${keyPath}${finalNames[index]}`] = path.parse(inputFile).name
    })
    fs.writeFileSync(path.join(outputDir, 'export_song_title.json'), JSON.stringify(titles, null, 2) + '\n', 'utf8')
    onProgress(`สร้าง export_song_title.json (${Object.keys(titles).length} เพลง)`)
  }

  onProgress('การประมวลผลทั้งหมดเสร็จสมบูรณ์!')
}
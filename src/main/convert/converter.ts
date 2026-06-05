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

function sanitizeFilename(filename: string): string {
  return filename
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

  await Promise.all(
    allFiles.map((inputFile) => {
      return new Promise<void>((resolve) => {
        const baseName = sanitizeFilename(path.parse(inputFile).name)
        const finalName = prefix ? `${prefix}_${baseName}` : baseName
        const outputFile = path.join(soundsDir, `${finalName}.ogg`)

        ffmpeg.ffprobe(inputFile, (err, metadata) => {
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

  onProgress('การประมวลผลทั้งหมดเสร็จสมบูรณ์!')
}
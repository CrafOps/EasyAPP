/* eslint-disable prettier/prettier */
import path from 'path'
import sharp from 'sharp'
import AdmZip from 'adm-zip'

function isPowerOfTwo(n: number): boolean {
    return (n & (n - 1)) === 0 && n !== 0
}

function nearestLowerPOT(n: number): number {
    return Math.pow(2, Math.floor(Math.log2(n)))
}

export interface ResizeConfig {
    maxSize?: number        // default 1024
    resizeThreshold?: number // default 2048
    longRatio?: number      // default 4
}

export interface ResizeReport {
    file: string
    width: number
    height: number
    isPOT: boolean
    action: 'skipped_npot' | 'skipped_long_texture' | 'resized' | 'copied'
    newWidth?: number
    newHeight?: number
}

export interface ResizeResult {
    outputPath: string
    report: ResizeReport[]
    totalFiles: number
    resizedCount: number
}

async function processTexture(
    inputBuffer: Buffer,
    relativePath: string,
    log: (msg: string) => void,
    MAX_SIZE: number,
    RESIZE_THRESHOLD: number,
    LONG_RATIO: number
): Promise<{ buffer: Buffer; entry: ResizeReport }> {
    const meta = await sharp(inputBuffer).metadata()
    const { width = 0, height = 0 } = meta

    const isPOT = isPowerOfTwo(width) && isPowerOfTwo(height)
    const ratio = height / width

    const entry: ResizeReport = {
        file: relativePath,
        width,
        height,
        isPOT,
        action: 'copied'
    }

    // NPOT → skip
    if (!isPOT) {
        entry.action = 'skipped_npot'
        log(`⏭️ SKIP NPOT: ${relativePath} (${width}x${height})`)
        return { buffer: inputBuffer, entry }
    }

    // Long texture (atlas/animation strip) → skip
    if (ratio >= LONG_RATIO) {
        entry.action = 'skipped_long_texture'
        log(`⏭️ SKIP LONG: ${relativePath} (${width}x${height})`)
        return { buffer: inputBuffer, entry }
    }

    // Resize เฉพาะที่ใหญ่จริง
    if (width >= RESIZE_THRESHOLD && height >= RESIZE_THRESHOLD) {
        const newWidth = Math.min(nearestLowerPOT(width), MAX_SIZE)
        const newHeight = Math.min(nearestLowerPOT(height), MAX_SIZE)

        const resized = await sharp(inputBuffer)
            .resize(newWidth, newHeight, { fit: 'fill' })
            .png()
            .toBuffer()

        entry.action = 'resized'
        entry.newWidth = newWidth
        entry.newHeight = newHeight
        log(`🔧 RESIZE: ${relativePath} (${width}x${height} → ${newWidth}x${newHeight})`)
        return { buffer: resized, entry }
    }

    // ปกติ → copy
    log(`✅ COPY: ${relativePath} (${width}x${height})`)
    return { buffer: inputBuffer, entry }
}

export async function resizeJarTextures(
    jarPath: string,
    modid: string,
    log: (msg: string) => void,
    config: ResizeConfig = {}
): Promise<ResizeResult> {
    const MAX_SIZE = config.maxSize ?? 1024
    const RESIZE_THRESHOLD = config.resizeThreshold ?? 2048
    const LONG_RATIO = config.longRatio ?? 4
    const jarName = path.basename(jarPath, '.jar')
    const outputJarName = `${jarName}-resize.jar`
    const outputJarPath = path.join(path.dirname(jarPath), outputJarName)

    const texturePrefix = `assets/${modid}/textures/`

    log(`📦 กำลังอ่าน JAR: ${path.basename(jarPath)}`)
    log(`🎯 Target modid: ${modid}`)
    log(`📂 Texture path: ${texturePrefix}`)
    log(``)

    const zip = new AdmZip(jarPath)
    const entries = zip.getEntries()

    const textureEntries = entries.filter(
        (e) => e.entryName.startsWith(texturePrefix) && e.entryName.endsWith('.png')
    )

    log(`🔍 พบ texture ทั้งหมด: ${textureEntries.length} ไฟล์`)
    log(``)

    const report: ResizeReport[] = []
    let resizedCount = 0

    // สร้าง ZIP ใหม่จากของเดิม
    const outputZip = new AdmZip(jarPath)

    for (const entry of textureEntries) {
        try {
            const buffer = entry.getData()
            const { buffer: newBuffer, entry: reportEntry } = await processTexture(
                buffer,
                entry.entryName,
                log,
                MAX_SIZE,
                RESIZE_THRESHOLD,
                LONG_RATIO
            )

            // อัพเดต entry ใน ZIP
            outputZip.deleteFile(entry.entryName)
            outputZip.addFile(entry.entryName, newBuffer)

            report.push(reportEntry)
            if (reportEntry.action === 'resized') resizedCount++
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err)
            log(`⚠️ Error: ${entry.entryName} - ${message}`)
        }
    }

    log(``)
    log(`💾 กำลังเขียน JAR ใหม่: ${outputJarName}`)
    outputZip.writeZip(outputJarPath)

    log(``)
    log(`✅ เสร็จแล้ว!`)
    log(`📊 Resize: ${resizedCount} ไฟล์ | รวม: ${textureEntries.length} ไฟล์`)
    log(`📁 Output: ${outputJarPath}`)

    return {
        outputPath: outputJarPath,
        report,
        totalFiles: textureEntries.length,
        resizedCount
    }
}

/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { JSX, useState } from 'react'
import { FolderOpen, Loader, Play } from 'lucide-react'
import { Logger } from '../convertaudio/Logger'
import { ToolbarActions } from '../shell/Toolbar'
import { Group, PathField, Row, StatusLine, Workspace } from '../ui'

type Status = 'idle' | 'processing' | 'done' | 'error'

const SIZES = [16, 32, 64, 128, 256, 512, 1024, 2048, 4096]

export const ResizePage = (): JSX.Element => {
    const [jarPath, setJarPath] = useState<string>('')
    const [modid, setModid] = useState<string>('')
    const [logs, setLogs] = useState<string[]>([])
    const [status, setStatus] = useState<Status>('idle')
    const [outputPath, setOutputPath] = useState<string>('')
    const [stats, setStats] = useState<{ total: number; resized: number } | null>(null)
    const [maxSize, setMaxSize] = useState<number>(1024)
    const [resizeThreshold, setResizeThreshold] = useState<number>(2048)
    const [longRatio, setLongRatio] = useState<number>(4)

    const appendLog = (msg: string): void => setLogs((prev) => [...prev, msg])

    const handleSelectJar = async (): Promise<void> => {
        const result = await (window as any).api.selectJar()
        if (result) setJarPath(result)
    }

    const handleRun = async (): Promise<void> => {
        if (!jarPath) return appendLog('❌ กรุณาเลือกไฟล์ JAR ก่อน')
        if (!modid.trim()) return appendLog('❌ กรุณาใส่ Mod ID ก่อน')

        setStatus('processing')
        setLogs([])
        setStats(null)
        setOutputPath('')

        try {
            const result = await (window as any).api.resizeTextures({ jarPath, modid: modid.trim(), maxSize, resizeThreshold, longRatio, })
            setOutputPath(result.outputPath)
            setStats({ total: result.totalFiles, resized: result.resizedCount })
            setStatus('done')
        } catch (err: any) {
            appendLog(`❌ Error: ${err.message || err}`)
            setStatus('error')
        }
    }

    // รับ log stream จาก main process
    useState(() => {
        ; (window as any).api?.onResizeLog?.((msg: string) => appendLog(msg))
    })

    const busy = status === 'processing'

    return (
        <Workspace>
            <ToolbarActions>
                <button
                    className="btn-ghost"
                    onClick={() => (window as any).api.showInFolder(outputPath)}
                    disabled={!outputPath}
                    title="เปิดไฟล์ผลลัพธ์"
                >
                    <FolderOpen size={15} strokeWidth={1.75} />
                </button>
                <button className="btn-primary" onClick={handleRun} disabled={busy || !jarPath || !modid.trim()}>
                    {busy ? <Loader size={14} className="animate-spin" /> : <Play size={14} />}
                    {busy ? 'กำลังประมวลผล…' : 'Resize'}
                </button>
            </ToolbarActions>

            <Group title="ต้นทาง">
                <Row label="ไฟล์ JAR" hint="Mod ที่ต้องการย่อ texture">
                    <PathField value={jarPath} placeholder="ยังไม่ได้เลือก" onPick={handleSelectJar} disabled={busy} />
                </Row>
                <Row label="Mod ID" hint={<span className="font-mono">assets/{modid || 'modid'}/textures/*</span>}>
                    <input
                        className="input w-56"
                        value={modid}
                        onChange={(e) => setModid(e.target.value)}
                        placeholder="aplace"
                        disabled={busy}
                    />
                </Row>
            </Group>

            <Group title="ขนาด">
                <Row label="ปรับขนาดเป็น" hint="ขนาดด้านยาวสูงสุดหลังย่อ">
                    <select value={maxSize} onChange={(e) => setMaxSize(Number(e.target.value))} disabled={busy} className="input w-28 text-right">
                        {SIZES.map((v) => <option key={v} value={v}>{v} px</option>)}
                    </select>
                </Row>
                <Row label="ย่อเมื่อใหญ่กว่า" hint="texture ที่เล็กกว่านี้จะไม่ถูกแตะ">
                    <select value={resizeThreshold} onChange={(e) => setResizeThreshold(Number(e.target.value))} disabled={busy} className="input w-28 text-right">
                        {SIZES.map((v) => <option key={v} value={v}>{v} px</option>)}
                    </select>
                </Row>
                <Row label="Long ratio" hint="อัตราส่วนด้านยาว ÷ ด้านสั้น ที่ถือว่าเป็นภาพยาว">
                    <input
                        type="number"
                        min={1}
                        value={longRatio}
                        onChange={(e) => setLongRatio(Number(e.target.value))}
                        disabled={busy}
                        className="input w-28 text-right"
                    />
                </Row>
            </Group>

            {status === 'done' && stats && (
                <StatusLine tone="ok">
                    ย่อแล้ว {stats.resized.toLocaleString()} จาก {stats.total.toLocaleString()} texture
                </StatusLine>
            )}
            {status === 'error' && <StatusLine tone="bad">เกิดข้อผิดพลาด — ดูรายละเอียดในบันทึก</StatusLine>}

            <Group title="บันทึก">
                <Logger logs={logs} className="h-56" />
            </Group>
        </Workspace>
    )
}

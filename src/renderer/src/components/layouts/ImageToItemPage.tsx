/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { JSX, useState, useEffect } from 'react'
import { FilePlus2, FolderOpen, FolderPlus, Loader, Play, X } from 'lucide-react'
import { Logger } from '../convertaudio/Logger'
import { ToolbarActions } from '../shell/Toolbar'
import { Group, PathField, Row, StatusLine, Workspace } from '../ui'

type Status = 'idle' | 'processing' | 'done' | 'error'
type InputMode = 'folder' | 'files'

export const ImageToItemPage = (): JSX.Element => {
    const [inputMode, setInputMode] = useState<InputMode>('folder')
    const [inputPaths, setInputPaths] = useState<string[]>([])
    const [outputDir, setOutputDir] = useState<string>('')
    const [modid, setModid] = useState<string>('')
    const [foodRegistry, setFoodRegistry] = useState<string>('FoodRegistries.CUSTOM_FOOD')
    const [logs, setLogs] = useState<string[]>([])
    const [status, setStatus] = useState<Status>('idle')
    const [stats, setStats] = useState<{ total: number } | null>(null)

    useEffect(() => {
        ; (window as any).api?.onItemLog?.((msg: string) => {
            setLogs((prev) => [...prev, msg])
        })
    }, [])

    const handleSelectFolder = async (): Promise<void> => {
        const result = await (window as any).api.selectPaths('folder')
        if (result?.[0]) {
            setInputMode('folder')
            setInputPaths([result[0]])
        }
    }

    const handleSelectFiles = async (): Promise<void> => {
        const result = await (window as any).api.selectPaths('multi')
        if (result) {
            setInputMode('files')
            setInputPaths(result.filter((f: string) => f.endsWith('.png')))
        }
    }

    const handleSelectOutput = async (): Promise<void> => {
        const result = await (window as any).api.selectOutput()
        if (result) setOutputDir(result)
    }

    const handleRun = async (): Promise<void> => {
        if (inputPaths.length === 0 || !outputDir || !modid.trim()) return

        setStatus('processing')
        setLogs([])
        setStats(null)

        try {
            const result = await (window as any).api.generateItems({
                inputPaths,
                inputMode,
                outputDir,
                modid: modid.trim(),
                foodRegistry: foodRegistry.trim(),
            })
            setStats({ total: result.totalFiles })
            setStatus('done')
        } catch (err: any) {
            setLogs((prev) => [...prev, `❌ Error: ${err.message || err}`])
            setStatus('error')
        }
    }

    const busy = status === 'processing'
    const hasInput = inputPaths.length > 0
    const id = modid || 'modid'

    return (
        <Workspace>
            <ToolbarActions>
                <button
                    className="btn-ghost"
                    onClick={() => (window as any).api.showInFolder(outputDir)}
                    disabled={!outputDir}
                    title="เปิดโฟลเดอร์ปลายทาง"
                >
                    <FolderOpen size={15} strokeWidth={1.75} />
                </button>
                <button className="btn-primary" onClick={handleRun} disabled={busy || !hasInput || !outputDir || !modid.trim()}>
                    {busy ? <Loader size={14} className="animate-spin" /> : <Play size={14} />}
                    {busy ? 'กำลังสร้าง…' : 'สร้างไอเทม'}
                </button>
            </ToolbarActions>

            <Group
                title="ไฟล์ PNG"
                description="ชื่อไฟล์จะกลายเป็นชื่อไอเทม"
                actions={
                    <>
                        <button className="btn h-7" onClick={handleSelectFiles} disabled={busy}><FilePlus2 size={14} strokeWidth={1.75} />ไฟล์</button>
                        <button className="btn h-7" onClick={handleSelectFolder} disabled={busy}><FolderPlus size={14} strokeWidth={1.75} />โฟลเดอร์</button>
                    </>
                }
            >
                {!hasInput ? (
                    <div className="px-4 py-8 text-center">
                        <p className="text-[13px] text-fg-2">ยังไม่ได้เลือก</p>
                        <p className="text-[12px] text-fg-3">เลือกทั้งโฟลเดอร์ หรือเลือกไฟล์ .png ทีละหลายไฟล์</p>
                    </div>
                ) : inputMode === 'folder' ? (
                    <Row label="โฟลเดอร์" hint={inputPaths[0]}>
                        <button className="btn-ghost h-7" onClick={() => setInputPaths([])}>นำออก</button>
                    </Row>
                ) : (
                    <div className="max-h-56 overflow-y-auto">
                        <table className="w-full table-fixed border-collapse text-[12.5px]">
                            <tbody>
                                {inputPaths.map((p, i) => (
                                    <tr key={p} className="group border-b border-line last:border-0 transition-colors hover:bg-hover">
                                        <td className="w-12 py-1.5 pr-2 pl-4 text-right text-fg-3">{i + 1}</td>
                                        <td className="truncate px-2 py-1.5" title={p}>{p.split(/[\\/]/).pop()}</td>
                                        <td className="w-10 pr-2">
                                            <button
                                                onClick={() => setInputPaths((prev) => prev.filter((f) => f !== p))}
                                                aria-label="นำออก"
                                                className="focus-ring rounded-md p-1 text-fg-3 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-pressed hover:text-bad focus-visible:opacity-100"
                                            >
                                                <X size={13} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Group>

            <Group title="การตั้งค่า">
                <Row label="Mod ID" hint={<span className="font-mono">{id}:item/foods/{'{name}'} · item.{id}.{'{name}'}</span>}>
                    <input className="input w-56" value={modid} onChange={(e) => setModid(e.target.value)} placeholder="mymod" disabled={busy} />
                </Row>
                <Row label="Food registry" hint={<span className="font-mono">.food({foodRegistry})</span>}>
                    <input className="input w-64 font-mono text-[12px]" value={foodRegistry} onChange={(e) => setFoodRegistry(e.target.value)} disabled={busy} />
                </Row>
                <Row label="โฟลเดอร์ผลลัพธ์">
                    <PathField value={outputDir} placeholder="ยังไม่ได้เลือก" onPick={handleSelectOutput} disabled={busy} />
                </Row>
            </Group>

            {status === 'done' && stats && (
                <StatusLine tone="ok">สร้างแล้ว {stats.total.toLocaleString()} ไอเทม</StatusLine>
            )}
            {status === 'error' && <StatusLine tone="bad">เกิดข้อผิดพลาด — ดูรายละเอียดในบันทึก</StatusLine>}

            <Group title="บันทึก">
                <Logger logs={logs} />
            </Group>
        </Workspace>
    )
}

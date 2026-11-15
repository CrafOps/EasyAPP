/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { JSX } from 'react'
import { FilePlus2, FolderPlus, FolderOpen, Loader, Play, X } from 'lucide-react'
import { Logger } from '../convertaudio/Logger'
import { ToolbarActions } from '../shell/Toolbar'
import { Group, PathField, Row, Switch, Workspace } from '../ui'

interface ConverterPageProps {
    inputPaths: string[]
    setInputPaths: (paths: string[]) => void
    outputDir: string
    setOutputDir: (dir: string) => void
    prefix: string
    setPrefix: (v: string) => void
    modid: string
    setModid: (v: string) => void
    stream: boolean
    setStream: (v: boolean) => void
    attenuation: number
    setAttenuation: (v: number) => void
    logs: string[]
    isProcessing: boolean
    onStart: () => void
}

const api = (): any => (window as any).api

const splitPath = (p: string): { name: string; dir: string; type: string } => {
    const parts = p.split(/[\\/]/)
    const name = parts.pop() ?? p
    const ext = /\.([a-z0-9]+)$/i.exec(name)?.[1]
    return { name, dir: parts.join('\\'), type: ext ? ext.toUpperCase() : 'โฟลเดอร์' }
}

export const ConverterPage = ({
    inputPaths, setInputPaths,
    outputDir, setOutputDir,
    prefix, setPrefix,
    modid, setModid,
    stream, setStream,
    attenuation, setAttenuation,
    logs, isProcessing, onStart
}: ConverterPageProps): JSX.Element => {

    const addPaths = async (type: 'multi' | 'folder'): Promise<void> => {
        const paths: string[] | null = await api().selectPaths(type)
        if (paths?.length) setInputPaths([...inputPaths, ...paths.filter((p) => !inputPaths.includes(p))])
    }

    const pickOutput = async (): Promise<void> => {
        const dir: string | null = await api().selectOutput()
        if (dir) {
            try { localStorage.setItem('outDir', dir) } catch { /* ignore */ }
            setOutputDir(dir)
        }
    }

    const canRun = inputPaths.length > 0 && !!outputDir && !isProcessing
    const sample = `${modid || 'modid'}:${prefix ? `${prefix}_` : ''}ชื่อไฟล์`

    return (
        <Workspace>
            <ToolbarActions>
                <button className="btn-ghost" onClick={() => api().showInFolder(outputDir)} disabled={!outputDir} title="เปิดโฟลเดอร์ปลายทาง">
                    <FolderOpen size={15} strokeWidth={1.75} />
                </button>
                <button className="btn-primary" onClick={onStart} disabled={!canRun}>
                    {isProcessing ? <Loader size={14} className="animate-spin" /> : <Play size={14} />}
                    {isProcessing ? 'กำลังแปลง…' : 'แปลงไฟล์'}
                </button>
            </ToolbarActions>

            <Group
                title="ไฟล์ต้นทาง"
                description="รองรับ .mp3 .wav .m4a .ogg — ชื่อภาษาไทยจะถูกแปลงเป็นอักษรอังกฤษอัตโนมัติ"
                actions={
                    <>
                        {inputPaths.length > 0 && (
                            <button className="btn-ghost h-7" onClick={() => setInputPaths([])}>ล้างทั้งหมด</button>
                        )}
                        <button className="btn h-7" onClick={() => addPaths('multi')}><FilePlus2 size={14} strokeWidth={1.75} />ไฟล์</button>
                        <button className="btn h-7" onClick={() => addPaths('folder')}><FolderPlus size={14} strokeWidth={1.75} />โฟลเดอร์</button>
                    </>
                }
            >
                {inputPaths.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                        <p className="text-[13px] text-fg-2">ยังไม่มีไฟล์</p>
                        <p className="text-[12px] text-fg-3">กด “ไฟล์” หรือ “โฟลเดอร์” เพื่อเพิ่มไฟล์เสียง</p>
                    </div>
                ) : (
                    <div className="max-h-64 overflow-y-auto">
                        <table className="w-full table-fixed border-collapse text-[12.5px]">
                            <thead className="sticky top-0 bg-group">
                                <tr className="border-b border-line text-left text-[11.5px] text-fg-3">
                                    <th className="w-12 py-2 pr-2 pl-4 text-right font-medium">#</th>
                                    <th className="px-2 py-2 font-medium">ชื่อ</th>
                                    <th className="w-[38%] px-2 py-2 font-medium">ตำแหน่ง</th>
                                    <th className="w-20 px-2 py-2 font-medium">ชนิด</th>
                                    <th className="w-10" />
                                </tr>
                            </thead>
                            <tbody>
                                {inputPaths.map((p, i) => {
                                    const f = splitPath(p)
                                    return (
                                        <tr key={p} className="group border-b border-line last:border-0 transition-colors hover:bg-hover">
                                            <td className="py-1.5 pr-2 pl-4 text-right text-fg-3">{i + 1}</td>
                                            <td className="truncate px-2 py-1.5" title={f.name}>{f.name}</td>
                                            <td className="truncate px-2 py-1.5 text-fg-3" title={f.dir}>{f.dir}</td>
                                            <td className="px-2 py-1.5 text-fg-2">{f.type}</td>
                                            <td className="pr-2">
                                                <button
                                                    onClick={() => setInputPaths(inputPaths.filter((x) => x !== p))}
                                                    aria-label={`ลบ ${f.name}`}
                                                    className="focus-ring rounded-md p-1 text-fg-3 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-pressed hover:text-bad focus-visible:opacity-100"
                                                >
                                                    <X size={13} />
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </Group>

            <Group title="การตั้งค่า">
                <Row label="Mod ID" hint={<span className="font-mono">{sample}</span>}>
                    <input className="input w-56" value={modid} placeholder="dimension" onChange={(e) => setModid(e.target.value)} />
                </Row>
                <Row label="Prefix" hint="นำหน้าชื่อเสียงทุกไฟล์ (ไม่บังคับ)">
                    <input className="input w-56" value={prefix} placeholder="ไม่มี" onChange={(e) => setPrefix(e.target.value)} />
                </Row>
                <Row label="Attenuation distance" hint="ระยะที่ได้ยินเสียง (บล็อก)">
                    <input
                        type="number"
                        min={1}
                        className="input w-24 text-right"
                        value={attenuation}
                        onChange={(e) => setAttenuation(Number(e.target.value))}
                    />
                </Row>
                <Row label="Streaming" hint="แนะนำให้เปิดสำหรับไฟล์ที่ยาว เช่น เพลง">
                    <Switch checked={stream} onChange={setStream} label="Streaming" />
                </Row>
            </Group>

            <Group title="ปลายทาง">
                <Row label="โฟลเดอร์ผลลัพธ์" hint="สร้าง sounds/, sound.txt, code_register.txt">
                    <PathField value={outputDir} placeholder="ยังไม่ได้เลือก" onPick={pickOutput} />
                </Row>
            </Group>

            <Group title="บันทึก">
                <Logger logs={logs} />
            </Group>
        </Workspace>
    )
}

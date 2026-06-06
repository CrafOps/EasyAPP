/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { JSX, useState, useRef } from 'react'
import { Package, FolderOpen, Play, FileArchive, CheckCircle, Loader } from 'lucide-react'

type Status = 'idle' | 'processing' | 'done' | 'error'

export const ResizePage = (): JSX.Element => {
    const [jarPath, setJarPath] = useState<string>('')
    const [modid, setModid] = useState<string>('')
    const [logs, setLogs] = useState<string[]>([])
    const [status, setStatus] = useState<Status>('idle')
    const [outputPath, setOutputPath] = useState<string>('')
    const [stats, setStats] = useState<{ total: number; resized: number } | null>(null)
    const logEndRef = useRef<HTMLDivElement>(null)
    const [maxSize, setMaxSize] = useState<number>(1024)
    const [resizeThreshold, setResizeThreshold] = useState<number>(2048)
    const [longRatio, setLongRatio] = useState<number>(4)

    const appendLog = (msg: string): void => {
        setLogs((prev) => {
            const next = [...prev, msg]
            setTimeout(() => logEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
            return next
        })
    }

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

    const jarName = jarPath ? jarPath.split(/[\\/]/).pop() : ''

    return (
        <div className="flex flex-col h-[calc(100vh-48px)] overflow-hidden">
            {/* Header */}
            <div className="px-5 pt-5 pb-3 border-b border-[#1a1a1a]">
                <div className="flex items-center gap-2 mb-1">
                    <Package size={14} className="text-[#666]" />
                    <span className="text-[9px] tracking-[0.2em] uppercase text-[#444]">
                        Texture Resizer
                    </span>
                </div>
                <p className="text-[10px] text-[#333]">Resize POT textures inside Minecraft mod JAR</p>
            </div>

            {/* Form */}
            <div className="px-5 py-4 flex flex-col gap-3 border-b border-[#1a1a1a]">
                {/* JAR Picker */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] tracking-[0.15em] uppercase text-[#444]">JAR File</label>
                    <button
                        onClick={handleSelectJar}
                        disabled={status === 'processing'}
                        className="flex items-center gap-2 w-full px-3 py-2.5 bg-[#111] border border-[#1e1e1e]
                       hover:border-[#333] transition-colors text-left disabled:opacity-40"
                    >
                        <FolderOpen size={13} className="text-[#555] shrink-0" />
                        <span className="text-[11px] text-[#666] truncate flex-1">
                            {jarName || 'เลือกไฟล์ .jar ...'}
                        </span>
                        {jarName && (
                            <FileArchive size={11} className="text-[#3a3a3a] shrink-0" />
                        )}
                    </button>
                </div>

                {/* Mod ID */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] tracking-[0.15em] uppercase text-[#444]">
                        Mod ID
                    </label>
                    <input
                        type="text"
                        value={modid}
                        onChange={(e) => setModid(e.target.value)}
                        placeholder="เช่น aplace, minecraft, ..."
                        disabled={status === 'processing'}
                        className="px-3 py-2.5 bg-[#111] border border-[#1e1e1e] text-[11px] text-[#c0c0c0]
                       placeholder:text-[#2a2a2a] focus:outline-none focus:border-[#333]
                       transition-colors disabled:opacity-40 font-mono"
                    />
                    {modid && (
                        <p className="text-[9px] text-[#333]">
                            Path: assets/<span className="text-[#555]">{modid}</span>/textures/*
                        </p>
                    )}
                </div>

                {/* Advanced Config */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] tracking-[0.15em] uppercase text-[#444]">
                        Config
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {/* Max Size */}
                        <div className="flex flex-col gap-1">
                            <span className="text-[8px] text-white/70 uppercase tracking-wider">Resize (ปรับขนาดเป็น)</span>
                            <select
                                value={maxSize}
                                onChange={(e) => setMaxSize(Number(e.target.value))}
                                disabled={status === 'processing'}
                                className="px-2 py-2 bg-[#111] border border-[#1e1e1e] text-[11px] text-[#c0c0c0]
                           focus:outline-none focus:border-[#333] transition-colors
                           disabled:opacity-40 font-mono text-center"
                            >
                                {[16, 32, 64, 128, 256, 512, 1024, 2048, 4096].map((v) => (
                                    <option key={v} value={v}>{v}</option>
                                ))}
                            </select>
                            <span className="text-[8px] text-[#2a2a2a] text-center">px</span>
                        </div>

                        {/* Resize Threshold */}
                        <div className="flex flex-col gap-1">
                            <span className="text-[8px] text-white/70 uppercase tracking-wider">Threshold (ปรับขนาดเมื่อ)</span>
                            <select
                                value={resizeThreshold}
                                onChange={(e) => setResizeThreshold(Number(e.target.value))}
                                disabled={status === 'processing'}
                                className="px-2 py-2 bg-[#111] border border-[#1e1e1e] text-[11px] text-[#c0c0c0]
                           focus:outline-none focus:border-[#333] transition-colors
                           disabled:opacity-40 font-mono text-center"
                            >
                                {[16, 32, 64, 128, 256, 512, 1024, 2048, 4096].map((v) => (
                                    <option key={v} value={v}>{v}</option>
                                ))}
                            </select>
                            <span className="text-[8px] text-[#2a2a2a] text-center">px</span>
                        </div>

                        {/* Long Ratio */}
                        <div className="flex flex-col gap-1">
                            <span className="text-[8px] text-white/70 uppercase tracking-wider">Long Ratio (ด้านที่ยาวกว่า)</span>
                            <input
                                type="number"
                                value={longRatio}
                                onChange={(e) => setLongRatio(Number(e.target.value))}
                                disabled={status === 'processing'}
                                className="px-2 py-2 bg-[#111] border border-[#1e1e1e] text-[11px] text-[#c0c0c0]
                           focus:outline-none focus:border-[#333] transition-colors
                           disabled:opacity-40 font-mono text-center"
                            />
                            <span className="text-[8px] text-[#2a2a2a] text-center">ratio</span>
                        </div>
                    </div>
                </div>

                {/* Run Button */}
                <button
                    onClick={handleRun}
                    disabled={status === 'processing' || !jarPath || !modid.trim()}
                    className="flex items-center justify-center gap-2 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a]
                     hover:border-[#444] hover:bg-[#222] transition-all text-[#888]
                     disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    {status === 'processing' ? (
                        <>
                            <Loader size={13} className="animate-spin" />
                            <span className="text-[10px] tracking-[0.15em] uppercase">Processing...</span>
                        </>
                    ) : (
                        <>
                            <Play size={13} />
                            <span className="text-[10px] tracking-[0.15em] uppercase">Run Resize</span>
                        </>
                    )}
                </button>
            </div>

            {/* Result Banner */}
            {status === 'done' && stats && (
                <div className="mx-5 mt-3 px-3 py-2.5 bg-[#0d1f0d] border border-[#1a3a1a] flex items-center gap-3">
                    <CheckCircle size={13} className="text-green-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-green-700">
                            Resize {stats.resized} / {stats.total} texture — เสร็จแล้ว
                        </p>
                        <p className="text-[9px] text-[#2a4a2a] truncate mt-0.5">{outputPath}</p>
                    </div>
                    <button
                        onClick={() => (window as any).api.showInFolder(outputPath)}
                        className="text-[9px] text-[#2a6a2a] hover:text-green-500 tracking-widest uppercase shrink-0"
                    >
                        เปิด
                    </button>
                </div>
            )}

            {/* Console Log */}
            <div className="flex-1 flex flex-col mx-5 mt-3 mb-3 min-h-0">
                <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[9px] tracking-[0.15em] uppercase text-[#333]">Console</span>
                    {logs.length > 0 && (
                        <span className="text-[8px] text-[#2a2a2a]">{logs.length} lines</span>
                    )}
                </div>
                <div className="flex-1 bg-[#080808] border border-[#141414] overflow-y-auto p-3 min-h-0">
                    {logs.length === 0 ? (
                        <p className="text-[10px] text-[#1e1e1e]">รอคำสั่ง...</p>
                    ) : (
                        logs.map((line, i) => (
                            <p key={i} className="text-[10px] text-[#4a4a4a] leading-5 font-mono">
                                {line}
                            </p>
                        ))
                    )}
                    <div ref={logEndRef} />
                </div>
            </div>
        </div>
    )
}
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { JSX, useState, useRef, useEffect } from 'react'
import { ImageIcon, FolderOpen, Files, Play, CheckCircle, Loader, X } from 'lucide-react'

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
    const logEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        ; (window as any).api?.onItemLog?.((msg: string) => {
            setLogs((prev) => {
                const next = [...prev, msg]
                setTimeout(() => logEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
                return next
            })
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

    const handleRemoveFile = (p: string): void => {
        setInputPaths((prev) => prev.filter((f) => f !== p))
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

    const inputLabel =
        inputMode === 'folder' && inputPaths[0]
            ? inputPaths[0].split(/[\\/]/).pop()
            : inputPaths.length > 0
                ? `${inputPaths.length} ไฟล์`
                : null

    return (
        <div
            className="text-[#c0c0c0] font-mono"
            style={{ height: 'calc(100vh - 48px)', overflowY: 'auto' }}
        >
            {/* Header */}
            <div className="px-5 pt-5 pb-3 border-b border-[#1a1a1a]">
                <div className="flex items-center gap-2 mb-1">
                    <ImageIcon size={14} className="text-[#666]" />
                    <span className="text-[9px] tracking-[0.2em] uppercase text-[#444]">
                        Image → Item Generator (Food types)
                    </span>
                </div>
                <p className="text-[10px] text-[#333]">แปลง PNG → model JSON + lang + code (Fabric)</p>
            </div>

            <div className="px-5 py-4 flex flex-col gap-3">

                {/* Input PNG */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] tracking-[0.15em] uppercase text-[#444]">Input PNG</label>
                    <div className="flex gap-2">
                        <button
                            onClick={handleSelectFolder}
                            disabled={status === 'processing'}
                            className={`flex items-center gap-1.5 px-3 py-2 border text-[10px] transition-colors flex-1 disabled:opacity-40
                ${inputMode === 'folder' && inputPaths.length > 0
                                    ? 'border-[#333] text-[#888] bg-[#161616]'
                                    : 'border-[#1e1e1e] text-[#444] bg-[#111] hover:border-[#2a2a2a]'}`}
                        >
                            <FolderOpen size={11} />
                            Folder
                        </button>
                        <button
                            onClick={handleSelectFiles}
                            disabled={status === 'processing'}
                            className={`flex items-center gap-1.5 px-3 py-2 border text-[10px] transition-colors flex-1 disabled:opacity-40
                ${inputMode === 'files' && inputPaths.length > 0
                                    ? 'border-[#333] text-[#888] bg-[#161616]'
                                    : 'border-[#1e1e1e] text-[#444] bg-[#111] hover:border-[#2a2a2a]'}`}
                        >
                            <Files size={11} />
                            Multi-file
                        </button>
                    </div>

                    {inputPaths.length > 0 && (
                        <div className="bg-[#0a0a0a] border border-[#161616] p-2 max-h-24 overflow-y-auto">
                            {inputMode === 'folder' ? (
                                <p className="text-[10px] text-[#555]">📁 {inputLabel}</p>
                            ) : (
                                inputPaths.map((p) => (
                                    <div key={p} className="flex items-center gap-1 group">
                                        <span className="text-[9px] text-[#444] truncate flex-1">
                                            {p.split(/[\\/]/).pop()}
                                        </span>
                                        <button
                                            onClick={() => handleRemoveFile(p)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={9} className="text-[#333] hover:text-[#666]" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Output Folder */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] tracking-[0.15em] uppercase text-[#444]">Output Folder</label>
                    <button
                        onClick={handleSelectOutput}
                        disabled={status === 'processing'}
                        className="flex items-center gap-2 px-3 py-2.5 bg-[#111] border border-[#1e1e1e]
                       hover:border-[#333] transition-colors text-left disabled:opacity-40"
                    >
                        <FolderOpen size={13} className="text-[#555] shrink-0" />
                        <span className="text-[11px] text-[#666] truncate flex-1">
                            {outputDir ? outputDir.split(/[\\/]/).pop() : 'เลือก output folder...'}
                        </span>
                    </button>
                </div>

                {/* Mod ID */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] tracking-[0.15em] uppercase text-[#444]">Mod ID</label>
                    <input
                        type="text"
                        value={modid}
                        onChange={(e) => setModid(e.target.value)}
                        placeholder="เช่น dimension, mymod, ..."
                        disabled={status === 'processing'}
                        className="px-3 py-2.5 bg-[#111] border border-[#1e1e1e] text-[11px] text-[#c0c0c0]
                       placeholder:text-[#2a2a2a] focus:outline-none focus:border-[#333]
                       transition-colors disabled:opacity-40 font-mono"
                    />
                    {modid && (
                        <p className="text-[9px] text-[#333]">
                            layer0: <span className="text-[#555]">{modid}:item/foods/&#123;name&#125;</span>
                            &nbsp;•&nbsp;lang: <span className="text-[#555]">item.{modid}.&#123;name&#125;</span>
                        </p>
                    )}
                </div>

                {/* Food Registry */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] tracking-[0.15em] uppercase text-[#444]">Food Registry</label>
                    <input
                        type="text"
                        value={foodRegistry}
                        onChange={(e) => setFoodRegistry(e.target.value)}
                        disabled={status === 'processing'}
                        className="px-3 py-2.5 bg-[#111] border border-[#1e1e1e] text-[11px] text-[#c0c0c0]
                       focus:outline-none focus:border-[#333] transition-colors
                       disabled:opacity-40 font-mono"
                    />
                    <p className="text-[9px] text-[#2a2a2a]">
                        ใช้ใน: .food(<span className="text-[#444]">{foodRegistry}</span>)
                    </p>
                </div>

                {/* Run */}
                <button
                    onClick={handleRun}
                    disabled={status === 'processing' || inputPaths.length === 0 || !outputDir || !modid.trim()}
                    className="flex items-center justify-center gap-2 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a]
                     hover:border-[#444] hover:bg-[#222] transition-all text-[#888]
                     disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    {status === 'processing' ? (
                        <>
                            <Loader size={13} className="animate-spin" />
                            <span className="text-[10px] tracking-[0.15em] uppercase">Generating...</span>
                        </>
                    ) : (
                        <>
                            <Play size={13} />
                            <span className="text-[10px] tracking-[0.15em] uppercase">Generate</span>
                        </>
                    )}
                </button>

                {/* Result */}
                {status === 'done' && stats && (
                    <div className="px-3 py-2.5 bg-[#0d1f0d] border border-[#1a3a1a] flex items-center gap-3">
                        <CheckCircle size={13} className="text-green-600 shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-green-700">สร้างแล้ว {stats.total} items</p>
                            <p className="text-[9px] text-[#2a4a2a] truncate mt-0.5">{outputDir}</p>
                        </div>
                        <button
                            onClick={() => (window as any).api.showInFolder(outputDir)}
                            className="text-[9px] text-[#2a6a2a] hover:text-green-500 tracking-widest uppercase shrink-0"
                        >
                            เปิด
                        </button>
                    </div>
                )}

                {/* Console */}
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] tracking-[0.15em] uppercase text-[#333]">Console</span>
                        {logs.length > 0 && (
                            <span className="text-[8px] text-[#2a2a2a]">{logs.length} lines</span>
                        )}
                    </div>
                    <div
                        className="bg-[#080808] border border-[#141414] overflow-y-auto p-3"
                        style={{ height: '180px' }}
                    >
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
        </div>
    )
}
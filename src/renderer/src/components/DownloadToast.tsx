/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { JSX, useEffect, useState } from 'react'
import { Download, CheckCircle, XCircle } from 'lucide-react'

interface DownloadItem {
    fileName: string
    percent: number
    state: 'downloading' | 'completed' | 'error'
    savePath?: string
}

export const DownloadToast = (): JSX.Element => {
    const [downloads, setDownloads] = useState<DownloadItem[]>([])

    useEffect(() => {
        const api = (window as any).api

        api.onDownloadStart(({ fileName }: { fileName: string }) => {
            setDownloads(prev => [...prev, { fileName, percent: 0, state: 'downloading' }])
        })

        api.onDownloadProgress(({ fileName, percent }: { fileName: string; percent: number }) => {
            setDownloads(prev =>
                prev.map(d => d.fileName === fileName ? { ...d, percent } : d)
            )
        })

        api.onDownloadDone(({ fileName, state, savePath }: any) => {
            setDownloads(prev =>
                prev.map(d =>
                    d.fileName === fileName
                        ? { ...d, percent: 100, state: state === 'completed' ? 'completed' : 'error', savePath }
                        : d
                )
            )
            // ลบออกหลัง 4 วินาที
            setTimeout(() => {
                setDownloads(prev => prev.filter(d => d.fileName !== fileName))
            }, 4000)
        })
    }, [])

    if (downloads.length === 0) return <></>

    return (
        <div className="fixed bottom-14 right-3 z-[100] flex flex-col gap-2 w-72">
            {downloads.map((d) => (
                <div
                    key={d.fileName}
                    className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 shadow-xl"
                >
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-2">
                        {d.state === 'completed' ? (
                            <CheckCircle size={14} className="text-green-400 shrink-0" />
                        ) : d.state === 'error' ? (
                            <XCircle size={14} className="text-red-400 shrink-0" />
                        ) : (
                            <Download size={14} className="text-blue-400 shrink-0 animate-bounce" />
                        )}
                        <span className="text-[10px] text-[#aaa] truncate flex-1">{d.fileName}</span>
                        <span className="text-[10px] text-[#666] shrink-0">{d.percent}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1 bg-[#2a2a2a] rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-300 ${d.state === 'completed' ? 'bg-green-500' :
                                    d.state === 'error' ? 'bg-red-500' : 'bg-blue-500'
                                }`}
                            style={{ width: `${d.percent}%` }}
                        />
                    </div>

                    {/* Status */}
                    <p className="text-[9px] text-[#555] mt-1">
                        {d.state === 'completed' ? `บันทึกที่: ${d.savePath}` :
                            d.state === 'error' ? 'ดาวน์โหลดล้มเหลว' : 'กำลังดาวน์โหลด...'}
                    </p>
                </div>
            ))}
        </div>
    )
}
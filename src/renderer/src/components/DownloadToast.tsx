/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { JSX, useEffect, useState } from 'react'

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
        <div className="fixed right-4 bottom-4 z-[100] flex w-80 flex-col gap-2" role="status" aria-live="polite">
            {downloads.map((d) => (
                <div
                    key={d.fileName}
                    className="animate-[fade-in_160ms_ease-out] rounded-xl border border-line bg-workspace p-3 shadow-lg shadow-black/10"
                >
                    <div className="flex items-baseline gap-3">
                        <span className="flex-1 truncate text-[12.5px] font-medium">{d.fileName}</span>
                        <span className="shrink-0 text-[12px] text-fg-3">
                            {d.state === 'error' ? 'ล้มเหลว' : `${d.percent}%`}
                        </span>
                    </div>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-line">
                        <div
                            className={`h-full rounded-full transition-[width] duration-300 ease-out ${d.state === 'error' ? 'bg-bad' : d.state === 'completed' ? 'bg-ok' : 'bg-accent'}`}
                            style={{ width: `${d.percent}%` }}
                        />
                    </div>
                    {d.state === 'completed' && d.savePath && (
                        <p className="mt-1.5 truncate text-[11.5px] text-fg-3" title={d.savePath}>{d.savePath}</p>
                    )}
                </div>
            ))}
        </div>
    )
}

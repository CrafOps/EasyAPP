/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { JSX, useEffect, useState } from 'react'
import { Check, Loader, RotateCw } from 'lucide-react'

type UpdateState = 'unsupported' | 'idle' | 'checking' | 'latest' | 'downloading' | 'ready' | 'error'

interface UpdateStatus {
    state: UpdateState
    version?: string
    percent?: number
    message?: string
}

const api = (): any => (window as any).api

/** มุมล่างของ sidebar: เวอร์ชันปัจจุบัน + สถานะอัปเดต */
export const UpdateFooter = ({ version }: { version?: string }): JSX.Element => {
    const [status, setStatus] = useState<UpdateStatus>({ state: 'unsupported' })

    useEffect(() => {
        api()?.updateGetStatus?.().then((s: UpdateStatus) => s && setStatus(s))
        return api()?.onUpdateStatus?.((s: UpdateStatus) => setStatus(s))
    }, [])

    const check = (): void => { api()?.updateCheck?.() }

    if (status.state === 'ready') {
        return (
            <div className="m-3 animate-[fade-in_160ms_ease-out] rounded-xl bg-accent-soft p-3" role="status">
                <p className="text-[12.5px] font-medium text-fg">อัปเดต v{status.version} พร้อมแล้ว</p>
                <p className="mt-0.5 text-[11.5px] text-fg-2">ติดตั้งให้อัตโนมัติเมื่อปิดแอป</p>
                <button className="btn-primary mt-2.5 h-7 w-full text-[12.5px]" onClick={() => api().updateInstall()}>
                    <RotateCw size={13} /> รีสตาร์ทเพื่ออัปเดต
                </button>
            </div>
        )
    }

    if (status.state === 'downloading') {
        const percent = status.percent ?? 0
        return (
            <div className="px-5 py-4" role="status" aria-live="polite">
                <div className="flex items-baseline justify-between text-[11.5px]">
                    <span className="text-fg-2">กำลังดาวน์โหลด v{status.version}</span>
                    <span className="text-fg-3">{percent}%</span>
                </div>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-line">
                    <div className="h-full rounded-full bg-accent transition-[width] duration-300 ease-out" style={{ width: `${percent}%` }} />
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-between gap-2 px-5 py-3.5 text-[11.5px]">
            <span className="text-fg-3">{version ? `v${version}` : ''}</span>

            {status.state === 'checking' && (
                <span className="flex items-center gap-1.5 text-fg-3">
                    <Loader size={12} className="animate-spin" /> กำลังตรวจสอบ…
                </span>
            )}
            {(status.state === 'idle' || status.state === 'latest') && (
                <button
                    onClick={check}
                    title="ตรวจสอบอัปเดต"
                    className="focus-ring -mr-1.5 flex items-center gap-1 rounded-md px-1.5 py-0.5 text-fg-3 transition-colors hover:bg-hover hover:text-accent"
                >
                    {status.state === 'latest' ? <><Check size={12} /> ล่าสุดแล้ว</> : 'ตรวจสอบอัปเดต'}
                </button>
            )}
            {status.state === 'error' && (
                <button
                    onClick={check}
                    title={status.message}
                    className="focus-ring -mr-1.5 rounded-md px-1.5 py-0.5 text-bad transition-colors hover:bg-hover"
                >
                    อัปเดตไม่สำเร็จ · ลองใหม่
                </button>
            )}
        </div>
    )
}

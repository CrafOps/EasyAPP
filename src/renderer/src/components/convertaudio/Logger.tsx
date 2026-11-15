/* eslint-disable prettier/prettier */
import { JSX, useEffect, useRef } from 'react'

const tone = (log: string): string => {
    if (log.startsWith('Error') || log.startsWith('❌')) return 'text-bad'
    if (log === 'สำเร็จ!' || log.startsWith('✅') || log.includes('เสร็จสมบูรณ์')) return 'text-ok'
    return 'text-fg-2'
}

interface LoggerProps {
    logs: string[]
    className?: string
}

/** Console แบบตาราง: เลขบรรทัดชิดขวา + ข้อความ */
export const Logger = ({ logs, className = 'h-44' }: LoggerProps): JSX.Element => {
    const endRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        endRef.current?.scrollIntoView({ block: 'nearest' })
    }, [logs])

    return (
        <div className={`overflow-y-auto py-2 font-mono text-[12px] leading-[20px] select-text ${className}`}>
            {logs.length === 0 ? (
                <p className="px-4 text-fg-3">ยังไม่มีบันทึก</p>
            ) : (
                <table className="w-full border-collapse">
                    <tbody>
                        {logs.map((log, i) => (
                            <tr key={i} className="align-top hover:bg-hover">
                                <td className="w-12 pr-3 pl-4 text-right text-fg-3 select-none">{i + 1}</td>
                                <td className={`pr-4 break-all ${tone(log)}`}>{log}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            <div ref={endRef} />
        </div>
    )
}

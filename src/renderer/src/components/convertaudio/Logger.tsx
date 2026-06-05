/* eslint-disable prettier/prettier */
import { JSX, useEffect, useRef } from 'react'

export const Logger = ({ logs }: { logs: string[] }): JSX.Element => {
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [logs])

    return (
        <div className="h-32 overflow-y-auto bg-gray-950 border border-gray-800 rounded-md p-3 font-mono text-[11px] leading-relaxed">
            {logs.length === 0 ? (
                <p className="text-gray-600 italic">waiting...</p>
            ) : (
                logs.map((log, i) => (
                    <p key={i} className={log.startsWith('Error') ? 'text-red-400' : log === 'สำเร็จ!' ? 'text-green-400' : 'text-gray-300'}>
                        <span className="text-gray-600 mr-2 select-none">$</span>{log}
                    </p>
                ))
            )}
            <div ref={bottomRef} />
        </div>
    )
}
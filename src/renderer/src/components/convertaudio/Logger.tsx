/* eslint-disable prettier/prettier */
import { JSX, useEffect, useRef } from 'react'

interface LoggerProps {
    logs: string[]
}

export const Logger = ({ logs }: LoggerProps): JSX.Element => {
    const scrollRef = useRef<HTMLDivElement>(null)
    useEffect((): void => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [logs])

    return (
        <div
            ref={scrollRef}
            style={{
                height: '300px',
                overflowY: 'scroll',
                background: '#1e1e1e',
                color: '#00ff00',
                padding: '10px',
                marginTop: '10px',
                fontFamily: 'monospace',
                fontSize: '14px',
                borderRadius: '5px'
            }}
        >
            {logs.map((log: string, index: number) => (
                <p key={index} style={{ margin: '2px 0' }}>
                    {`> ${log}`}
                </p>
            ))}
        </div>
    )
}
/* eslint-disable prettier/prettier */
import { JSX, useState, useEffect } from 'react'

interface OutputConfigProps {
    onDirChange: (path: string) => void
}

export const OutputConfig = ({ onDirChange }: OutputConfigProps): JSX.Element => {
    const [dir, setDir] = useState<string>(() => localStorage.getItem('outDir') || '')

    useEffect((): void => {
        if (dir) onDirChange(dir)
    }, [dir, onDirChange])

    const select = async (): Promise<void> => {
        const path = await window.api.selectOutput()
        if (path) {
            setDir(path)
            localStorage.setItem('outDir', path)
            onDirChange(path)
        }
    }

    return (
        <button onClick={select}>
            Output: {dir || 'ยังไม่ได้เลือกที่อยู่'}
        </button>
    )
}
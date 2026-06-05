/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */
import { JSX, useState, useEffect } from 'react'
import { FolderOpen } from 'lucide-react'

export const OutputConfig = ({ onDirChange }: { onDirChange: (path: string) => void }): JSX.Element => {
    const [currentPath, setCurrentPath] = useState<string>('')

    useEffect(() => {
        const saved = localStorage.getItem('outDir')
        if (saved) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCurrentPath(saved)
            onDirChange(saved)
        }
    }, [onDirChange])

    const select = async (): Promise<void> => {
        const path = await (window as any).api.selectOutput()
        if (path) {
            localStorage.setItem('outDir', path)
            setCurrentPath(path)
            onDirChange(path)
        }
    }

    return (
        <div className="flex items-center gap-3 w-full">
            <button
                onClick={select}
                className="flex items-center gap-1.5 text-[11px] text-gray-400 border border-gray-800 rounded px-2.5 py-1.5 hover:border-gray-600 hover:text-gray-200 transition-all font-mono whitespace-nowrap"
            >
                <FolderOpen size={13} />
                Change
            </button>
            <span
                className="text-[11px] text-gray-500 font-mono truncate cursor-pointer hover:text-gray-300 transition-colors"
                title={currentPath}
                onClick={select}
            >
                {currentPath || 'no directory selected'}
            </span>
        </div>
    )
}
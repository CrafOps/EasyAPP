/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { JSX } from 'react'

interface FileSelectorProps {
    onAddPaths: (paths: string[]) => void
}

export const FileSelector = ({ onAddPaths }: FileSelectorProps): JSX.Element => {
    const handleSelect = async (type: 'file' | 'folder' | 'multi'): Promise<void> => {
        const paths = await (window as any).api.selectPaths(type)
        if (paths && paths.length > 0) onAddPaths(paths)
    }

    const btnClass =
        'font-mono text-[11px] tracking-[0.15em] uppercase px-4 py-2 ' +
        'border border-[#222] text-[#555] rounded ' +
        'hover:border-[#3a3a3a] hover:text-[#888] transition-colors'

    return (
        <div className="flex flex-wrap gap-2 mb-4">
            <button className={btnClass} onClick={() => handleSelect('file')}>
                Single File (ไฟล์เดียว)
            </button>
            <button className={btnClass} onClick={() => handleSelect('multi')}>
                Multi File (หลายไฟล์)
            </button>
            <button className={btnClass} onClick={() => handleSelect('folder')}>
                Folder (โฟลเดอร์)
            </button>
        </div>
    )
}

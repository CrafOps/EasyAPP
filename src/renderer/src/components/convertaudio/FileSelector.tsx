/* eslint-disable prettier/prettier */
import { JSX } from 'react'

interface FileSelectorProps {
    onAddPaths: (paths: string[]) => void
}

export const FileSelector = ({ onAddPaths }: FileSelectorProps): JSX.Element => {

    const handleSelect = async (type: 'file' | 'folder' | 'multi'): Promise<void> => {
        const paths = await window.api.selectPaths(type)
        if (paths && paths.length > 0) {
            onAddPaths(paths)
        }
    }

    return (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <button onClick={(): Promise<void> => handleSelect('file')}>
                เพิ่มไฟล์
            </button>
            <button onClick={(): Promise<void> => handleSelect('multi')}>
                เพิ่มหลายไฟล์
            </button>
            <button onClick={(): Promise<void> => handleSelect('folder')}>
                เพิ่มโฟลเดอร์
            </button>
        </div>
    )
}
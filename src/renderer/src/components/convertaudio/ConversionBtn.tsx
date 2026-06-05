/* eslint-disable prettier/prettier */
import { JSX } from 'react'

interface ConversionBtnProps {
    onStart: () => Promise<void>
    isProcessing: boolean
    disabled: boolean
}

export const ConversionBtn = ({
    onStart,
    isProcessing,
    disabled
}: ConversionBtnProps): JSX.Element => {

    const handleClick = async (): Promise<void> => {
        await onStart()
    }

    return (
        <button
            onClick={handleClick}
            disabled={disabled || isProcessing}
            style={{ padding: '10px 20px', cursor: disabled ? 'not-allowed' : 'pointer' }}
        >
            {isProcessing ? 'กำลังแปลงไฟล์...' : 'เริ่มแปลงไฟล์'}
        </button>
    )
}
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { JSX } from 'react'

export const ConversionBtn = ({ onStart, isProcessing, disabled }: any): JSX.Element => (
    <button
        onClick={onStart}
        disabled={disabled || isProcessing}
        className={`
      font-mono text-[11px] tracking-[0.2em] uppercase px-6 py-2.5 rounded transition-all
      ${isProcessing
                ? 'border border-[#2a2a2a] text-[#444] cursor-not-allowed'
                : disabled
                    ? 'border border-[#1e1e1e] text-[#333] cursor-not-allowed'
                    : 'border border-[#444] text-[#aaa] hover:border-[#777] hover:text-[#ddd] active:scale-[0.98]'
            }
    `}
    >
        {isProcessing ? (
            <span className="flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#555] animate-pulse" />
                Converting
            </span>
        ) : 'Run'}
    </button>
)
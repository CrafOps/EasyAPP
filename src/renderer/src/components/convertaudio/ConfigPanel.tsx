/* eslint-disable prettier/prettier */
import { JSX } from 'react'

interface ConfigPanelProps {
    prefix: string
    setPrefix: (v: string) => void
    modid: string
    setModid: (v: string) => void
    stream: boolean
    setStream: (v: boolean) => void
    attenuation: number
    setAttenuation: (v: number) => void
}

const inputClass =
    'w-full bg-transparent border border-[#222] rounded px-3 py-2 text-[13px] text-[#c0c0c0] font-mono ' +
    'focus:border-[#444] focus:outline-none placeholder-[#383838] transition-colors'

const labelClass = 'block text-[10px] text-[#555] tracking-[0.15em] uppercase mb-1.5'

export const ConfigPanel = ({
    prefix, setPrefix,
    modid, setModid,
    stream, setStream,
    attenuation, setAttenuation
}: ConfigPanelProps): JSX.Element => (
    <div className="grid grid-cols-2 gap-x-6 gap-y-5">
        <div>
            <label className={labelClass}>Prefix</label>
            <input
                className={inputClass}
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
            />
        </div>
        <div>
            <label className={labelClass}>Mod ID</label>
            <input
                className={inputClass}
                value={modid}
                onChange={(e) => setModid(e.target.value)}
            />
        </div>
        <div>
            <label className={labelClass}>Attenuation Distance</label>
            <input
                type="number"
                className={inputClass}
                value={attenuation}
                onChange={(e) => setAttenuation(Number(e.target.value))}
            />
        </div>
        <div>
            <span className={labelClass}>Streaming</span>
            <div className="flex items-center gap-2.5 cursor-pointer h-[38px]" onClick={() => setStream(!stream)}>
                <div className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${stream ? 'bg-[#4a7a4a]' : 'bg-[#2a2a2a]'
                    }`}>
                    <div className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${stream ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                </div>
                <span className={`text-[12px] font-mono tracking-wide transition-colors ${stream ? 'text-[#888]' : 'text-[#444]'
                    }`}>
                    {stream ? 'Enabled' : 'Disabled'}
                </span>
            </div>
        </div>
    </div>
)
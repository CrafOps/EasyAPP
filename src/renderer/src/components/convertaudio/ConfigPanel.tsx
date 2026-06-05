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
        <div className="flex items-end pb-0.5">
            <label className="flex items-center gap-2.5 cursor-pointer group">
                <div
                    onClick={() => setStream(!stream)}
                    className={`w-8 h-4 rounded-full relative transition-colors cursor-pointer ${stream ? 'bg-[#3a5a3a]' : 'bg-[#222]'
                        } border ${stream ? 'border-[#4a7a4a]' : 'border-[#333]'}`}
                >
                    <div className={`absolute top-0.5 w-3 h-3 rounded-full transition-all ${stream ? 'left-[18px] bg-[#6aaf6a]' : 'left-0.5 bg-[#444]'
                        }`} />
                </div>
                <span className={`text-[12px] font-mono tracking-wide transition-colors ${stream ? 'text-[#888]' : 'text-[#444]'
                    }`}>
                    Streaming
                </span>
            </label>
        </div>
    </div>
)
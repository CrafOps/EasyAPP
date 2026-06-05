/* eslint-disable prettier/prettier */
import { JSX } from 'react'
import { FileSelector } from '../convertaudio/FileSelector'
import { OutputConfig } from '../convertaudio/OutputConfig'
import { ConversionBtn } from '../convertaudio/ConversionBtn'
import { Logger } from '../convertaudio/Logger'
import { ConfigPanel } from '../convertaudio/ConfigPanel'

interface ConverterPageProps {
    inputPaths: string[]
    setInputPaths: (paths: string[]) => void
    outputDir: string
    setOutputDir: (dir: string) => void
    prefix: string
    setPrefix: (v: string) => void
    modid: string
    setModid: (v: string) => void
    stream: boolean
    setStream: (v: boolean) => void
    attenuation: number
    setAttenuation: (v: number) => void
    logs: string[]
    isProcessing: boolean
    onStart: () => void
}

export const ConverterPage = ({
    inputPaths, setInputPaths,
    outputDir, setOutputDir,
    prefix, setPrefix,
    modid, setModid,
    stream, setStream,
    attenuation, setAttenuation,
    logs, isProcessing, onStart
}: ConverterPageProps): JSX.Element => {

    const handleRemovePath = (i: number): void =>
        setInputPaths(inputPaths.filter((_, idx) => idx !== i))

    return (
        <div className="max-w-2xl mx-auto px-6 pt-8 pb-6 space-y-8">

            <header className="pb-5 border-b border-[#2a2a2a]">
                <div className="flex items-baseline gap-2">
                    <span className="text-[13px] text-[#666] tracking-[0.08em] uppercase">Craft Operation Group</span>
                    <span className="text-[#333]">/</span>
                    <span className="text-[13px] text-[#aaa] tracking-[0.08em]">Audio Converter for Minecraft</span>
                </div>
                <p className="text-[10px] text-[#3a3a3a] tracking-[0.15em] uppercase mt-1">v1.0.0-@PPekKunGzDev</p>
            </header>

            {/* Section 1 — blue accent */}
            <section>
                <p className="text-[10px] text-[#4a90d9] tracking-[0.15em] uppercase mb-3 flex items-center gap-2">
                    <span className="text-[#4a90d9] font-mono">#1</span>
                    <span className="text-[#555]">Source Files</span>
                </p>
                <FileSelector onAddPaths={(p) => setInputPaths([...inputPaths, ...p])} />
                {inputPaths.length > 0 && (
                    <div className="border border-[#2a2a2a] rounded overflow-hidden">
                        {inputPaths.map((path, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between px-3 py-2 text-[11px] text-[#888] border-b border-[#222] last:border-0 hover:bg-[#141414] transition-colors"
                            >
                                <span className="truncate">{path.split(/[\\/]/).pop()}</span>
                                <button
                                    onClick={() => handleRemovePath(i)}
                                    className="ml-3 text-[#555] hover:text-[#cc6666] transition-colors shrink-0 text-[15px] leading-none"
                                >×</button>
                            </div>
                        ))}
                        <div className="flex justify-between items-center px-3 py-1.5 bg-[#0d0d0d]">
                            <span className="text-[10px] text-[#555]">{inputPaths.length} file{inputPaths.length > 1 ? 's' : ''}</span>
                            <button
                                onClick={() => setInputPaths([])}
                                className="text-[10px] text-[#555] hover:text-[#cc6666] cursor-pointer transition-colors"
                            >clear all</button>
                        </div>
                    </div>
                )}
            </section>

            {/* Section 2 — amber accent */}
            <section>
                <p className="text-[10px] tracking-[0.15em] uppercase mb-3 flex items-center gap-2">
                    <span className="text-[#c8922a] font-mono">#2</span>
                    <span className="text-[#555]">Configuration</span>
                </p>
                <ConfigPanel
                    prefix={prefix} setPrefix={setPrefix}
                    modid={modid} setModid={setModid}
                    stream={stream} setStream={setStream}
                    attenuation={attenuation} setAttenuation={setAttenuation}
                />
            </section>

            {/* Section 3 — green accent */}
            <section>
                <p className="text-[10px] tracking-[0.15em] uppercase mb-3 flex items-center gap-2">
                    <span className="text-[#5a9e6f] font-mono">#3</span>
                    <span className="text-[#555]">Output</span>
                </p>
                <div className="flex items-center justify-between gap-4">
                    <OutputConfig onDirChange={setOutputDir} />
                    <ConversionBtn
                        onStart={onStart}
                        isProcessing={isProcessing}
                        disabled={inputPaths.length === 0 || !outputDir}
                    />
                </div>
            </section>

            {/* Console — muted */}
            <section>
                <p className="text-[10px] tracking-[0.15em] uppercase mb-2 flex items-center gap-2">
                    <span className="text-[#555] font-mono">—</span>
                    <span className="text-[#555]">Console</span>
                </p>
                <Logger logs={logs} />
            </section>

        </div>
    )
}
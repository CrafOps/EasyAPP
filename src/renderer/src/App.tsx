/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { JSX, useState, useEffect } from 'react'
import { FileSelector } from './components/convertaudio/FileSelector'
import { OutputConfig } from './components/convertaudio/OutputConfig'
import { ConversionBtn } from './components/convertaudio/ConversionBtn'
import { Logger } from './components/convertaudio/Logger'
import { ConfigPanel } from './components/convertaudio/ConfigPanel'

function App(): JSX.Element {
  const [logs, setLogs] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [inputPaths, setInputPaths] = useState<string[]>([])
  const [outputDir, setOutputDir] = useState<string>('')
  const [prefix, setPrefix] = useState<string>('mod')
  const [modid, setModid] = useState<string>('minecraft')
  const [stream, setStream] = useState<boolean>(true)
  const [attenuation, setAttenuation] = useState<number>(16)

  useEffect(() => {
    return (window as any).api.onLog((msg: string) => {
      setLogs((prev) => [...prev, msg])
    })
  }, [])

  const handleRemovePath = (indexToRemove: number): void => {
    setInputPaths((prev) => prev.filter((_, index) => index !== indexToRemove))
  }

  const handleStart = async (): Promise<void> => {
    if (inputPaths.length === 0) {
      setLogs((prev) => [...prev, "Error: ยังไม่ได้เลือกไฟล์"])
      return
    }
    if (!outputDir) {
      setLogs((prev) => [...prev, "Error: ยังไม่ได้เลือก Output Directory"])
      return
    }

    setIsProcessing(true)
    setLogs([])

    try {
      if (!(window as any).api) {
        throw new Error("window.api ไม่ถูกโหลด (Preload script อาจทำงานพลาด)")
      }
      await (window as any).api.startConvert({
        inputPaths, outputDir, prefix, modid, stream,
        attenuationDistance: attenuation
      })
      setLogs((prev) => [...prev, "สำเร็จ!"])
    } catch (err: any) {
      setLogs((prev) => [...prev, `Error: ${err.message || err}`])
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-[#d4d4d4] font-mono">
      {/* Top bar */}
      <div className="border-b border-[#222] px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[10px] tracking-[0.2em] text-[#555] uppercase">CrafOps</span>
          <span className="text-[#333]">/</span>
          <span className="text-[13px] text-[#aaa] tracking-wide">Audio Converter</span>
        </div>
        <span className="text-[10px] text-[#444] tracking-widest uppercase">v1.0</span>
      </div>

      <div className="max-w-3xl mx-auto px-8 py-10 space-y-8">

        {/* Input section */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <span className="text-[10px] text-[#555] tracking-[0.2em] uppercase w-4 text-center">01</span>
            <span className="text-[11px] text-[#666] tracking-[0.15em] uppercase">Source Files</span>
          </div>

          <div className="pl-7">
            <FileSelector onAddPaths={setInputPaths} />

            {inputPaths.length > 0 && (
              <div className="mt-3 border border-[#1e1e1e] rounded">
                <div className="flex justify-between items-center px-3 py-2 border-b border-[#1e1e1e]">
                  <span className="text-[10px] text-[#555] tracking-widest">
                    {inputPaths.length} FILE{inputPaths.length > 1 ? 'S' : ''} SELECTED
                  </span>
                  <button
                    onClick={() => setInputPaths([])}
                    className="text-[10px] text-[#444] hover:text-[#888] tracking-widest transition-colors"
                  >
                    CLEAR ALL
                  </button>
                </div>
                <div className="max-h-36 overflow-y-auto">
                  {inputPaths.map((path, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center px-3 py-2 border-b border-[#181818] last:border-0 group hover:bg-[#141414] transition-colors"
                    >
                      <span className="text-[12px] text-[#888] truncate flex-1">
                        {path.split(/[\\/]/).pop()}
                      </span>
                      <button
                        onClick={() => handleRemovePath(index)}
                        className="text-[#333] hover:text-[#c04040] text-base leading-none ml-4 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Config section */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <span className="text-[10px] text-[#555] tracking-[0.2em] uppercase w-4 text-center">02</span>
            <span className="text-[11px] text-[#666] tracking-[0.15em] uppercase">Configuration</span>
          </div>
          <div className="pl-7">
            <ConfigPanel
              prefix={prefix} setPrefix={setPrefix}
              modid={modid} setModid={setModid}
              stream={stream} setStream={setStream}
              attenuation={attenuation} setAttenuation={setAttenuation}
            />
          </div>
        </div>

        {/* Output + Convert */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <span className="text-[10px] text-[#555] tracking-[0.2em] uppercase w-4 text-center">03</span>
            <span className="text-[11px] text-[#666] tracking-[0.15em] uppercase">Output</span>
          </div>
          <div className="pl-7 flex items-center justify-between gap-4">
            <OutputConfig onDirChange={setOutputDir} />
            <ConversionBtn
              onStart={handleStart}
              isProcessing={isProcessing}
              disabled={inputPaths.length === 0 || !outputDir}
            />
          </div>
        </div>

        {/* Log */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <span className="text-[10px] text-[#555] tracking-[0.2em] uppercase w-4 text-center">—</span>
            <span className="text-[11px] text-[#666] tracking-[0.15em] uppercase">Console</span>
          </div>
          <div className="pl-7">
            <Logger logs={logs} />
          </div>
        </div>

      </div>
    </div>
  )
}

export default App
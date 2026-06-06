/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { JSX, useState, useEffect } from 'react'
import { ConverterPage } from './components/layouts/ConverterPage'
import { BottomNav } from './components/layouts/BottomNav'
import { LoadplengPage } from './components/layouts/LoadplengPage'
import { DownloadToast } from './components/DownloadToast'
import { ResizePage } from './components/layouts/ResizePage'

function App(): JSX.Element {
  const [logs, setLogs] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [inputPaths, setInputPaths] = useState<string[]>([])
  const [outputDir, setOutputDir] = useState<string>('')
  const [prefix, setPrefix] = useState<string>('')
  const [modid, setModid] = useState<string>('dimension')
  const [stream, setStream] = useState<boolean>(true)
  const [attenuation, setAttenuation] = useState<number>(16)
  const [activeTab, setActiveTab] = useState<string>('converter')

  useEffect(() => {
    return (window as any).api.onLog((msg: string) => {
      setLogs((prev) => [...prev, msg])
    })
  }, [])

  const handleStart = async (): Promise<void> => {
    if (inputPaths.length === 0) {
      setLogs((prev) => [...prev, 'Error: ยังไม่ได้เลือกไฟล์'])
      return
    }
    if (!outputDir) {
      setLogs((prev) => [...prev, 'Error: ยังไม่ได้เลือก Output Directory'])
      return
    }
    setIsProcessing(true)
    setLogs([])
    try {
      await (window as any).api.startConvert({
        inputPaths, outputDir, prefix, modid, stream, attenuationDistance: attenuation
      })
      setLogs((prev) => [...prev, 'สำเร็จ!'])
    } catch (err: any) {
      setLogs((prev) => [...prev, `Error: ${err.message || err}`])
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-[#c0c0c0] font-mono pb-12">
      {activeTab === 'converter' && (
        <ConverterPage
          inputPaths={inputPaths} setInputPaths={setInputPaths}
          outputDir={outputDir} setOutputDir={setOutputDir}
          prefix={prefix} setPrefix={setPrefix}
          modid={modid} setModid={setModid}
          stream={stream} setStream={setStream}
          attenuation={attenuation} setAttenuation={setAttenuation}
          logs={logs} isProcessing={isProcessing} onStart={handleStart}
        />
      )}
      {activeTab === 'loadpleng' && (<LoadplengPage />)}
      {activeTab === 'resizer' && <ResizePage />}
      <DownloadToast />
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}

export default App
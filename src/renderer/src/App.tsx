/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { JSX, useState, useEffect, useRef } from 'react'
import { ConverterPage } from './components/layouts/ConverterPage'
import { LoadplengPage } from './components/layouts/LoadplengPage'
import { DownloadToast } from './components/DownloadToast'
import { ResizePage } from './components/layouts/ResizePage'
import { ImageToItemPage } from './components/layouts/ImageToItemPage'
import { Sidebar } from './components/shell/Sidebar'
import { Toolbar } from './components/shell/Toolbar'
import { ToolbarSlotContext } from './components/shell/toolbarSlot'
import { TOOLS, ToolId, matchTool } from './components/shell/tools'

const savedOutDir = (): string => {
  try { return localStorage.getItem('outDir') ?? '' } catch { return '' }
}

function App(): JSX.Element {
  const [logs, setLogs] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [inputPaths, setInputPaths] = useState<string[]>([])
  const [outputDir, setOutputDir] = useState<string>(savedOutDir)
  const [prefix, setPrefix] = useState<string>('')
  const [modid, setModid] = useState<string>('dimension')
  const [stream, setStream] = useState<boolean>(true)
  const [attenuation, setAttenuation] = useState<number>(16)
  const [activeTab, setActiveTab] = useState<ToolId>('converter')
  const [query, setQuery] = useState<string>('')
  const [toolbarSlot, setToolbarSlot] = useState<HTMLElement | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return (window as any).api.onLog((msg: string) => {
      setLogs((prev) => [...prev, msg])
    })
  }, [])

  // Ctrl+K = ค้นหา, Ctrl+1..4 = สลับเครื่องมือ
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (!(e.ctrlKey || e.metaKey)) return
      if (e.key.toLowerCase() === 'k') {
        e.preventDefault()
        searchRef.current?.focus()
        searchRef.current?.select()
        return
      }
      const tool = TOOLS[Number(e.key) - 1]
      if (tool) {
        e.preventDefault()
        setActiveTab(tool.id)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
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

  const selectTool = (id: ToolId): void => {
    setActiveTab(id)
    setQuery('')
  }

  const submitQuery = (): void => {
    const first = TOOLS.find((t) => matchTool(t, query))
    if (first) {
      selectTool(first.id)
      searchRef.current?.blur()
    }
  }

  const tool = TOOLS.find((t) => t.id === activeTab) ?? TOOLS[0]

  return (
    <ToolbarSlotContext.Provider value={toolbarSlot}>
      <div className="flex h-full">
        <Sidebar active={activeTab} query={query} onSelect={selectTool} />

        <main className="flex min-w-0 flex-1 flex-col bg-workspace">
          <Toolbar
            title={tool.label}
            query={query}
            onQueryChange={setQuery}
            onSubmitQuery={submitQuery}
            searchRef={searchRef}
            slotRef={setToolbarSlot}
          />

          <div key={activeTab} className="min-h-0 flex-1 animate-[fade-in_160ms_ease-out] overflow-y-auto">
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
            {activeTab === 'loadpleng' && <LoadplengPage />}
            {activeTab === 'resizer' && <ResizePage />}
            {activeTab === 'image-to-item' && <ImageToItemPage />}
          </div>
        </main>

        <DownloadToast />
      </div>
    </ToolbarSlotContext.Provider>
  )
}

export default App

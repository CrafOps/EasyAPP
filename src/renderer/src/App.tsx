/* eslint-disable @typescript-eslint/no-explicit-any */
import { JSX, useState, useEffect } from 'react'
import { FileSelector } from './components/convertaudio/FileSelector'
import { OutputConfig } from './components/convertaudio/OutputConfig'
import { ConversionBtn } from './components/convertaudio/ConversionBtn'
import { Logger } from './components/convertaudio/Logger'

function App(): JSX.Element {
  const [logs, setLogs] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [inputPaths, setInputPaths] = useState<string[]>([])
  const [outputDir, setOutputDir] = useState<string>('')

  useEffect(() => {
    const cleanup = (window as any).api.onLog((msg: string) => {
      setLogs((prev) => [...prev, msg])
    })
    return cleanup
  }, [])

  const handleStart = async (): Promise<void> => {
    if (inputPaths.length === 0 || !outputDir) return
    setIsProcessing(true)
    setLogs([])

    try {
      await (window as any).api.startConvert({
        inputPaths,
        outputDir,
        prefix: 'mod',
        modid: 'minecraft',
        stream: true,
        attenuationDistance: 16
      })
    } catch (err) {
      setLogs((prev) => [...prev, `Error: ${err}`])
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Audio Converter</h1>
      <section><FileSelector onAddPaths={setInputPaths} /></section>
      <section><OutputConfig onDirChange={setOutputDir} /></section>
      <section><ConversionBtn onStart={handleStart} isProcessing={isProcessing} disabled={inputPaths.length === 0 || !outputDir} /></section>
      <section><Logger logs={logs} /></section>
    </div>
  )
}

export default App

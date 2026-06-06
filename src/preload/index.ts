import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  startConvert: (config: any) => ipcRenderer.invoke('start-conversion', config),
  selectPaths: (type: 'file' | 'folder' | 'multi') => ipcRenderer.invoke('select-paths', type),
  selectOutput: () => ipcRenderer.invoke('select-output'),
  onLog: (callback: (msg: string) => void) => {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const subscription = (_event: IpcRendererEvent, value: string) => callback(value)
    ipcRenderer.on('conversion-log', subscription)
    return () => ipcRenderer.removeListener('conversion-log', subscription)
  },
  closeWindow: () => ipcRenderer.send('window-close'),
  minimizeWindow: () => ipcRenderer.send('window-minimize'),

  onDownloadStart: (cb: (data: { fileName: string; totalBytes: number }) => void) => ipcRenderer.on('download-start', (_e, data) => cb(data)),
  onDownloadProgress: (
    cb: (data: { fileName: string; received: number; total: number; percent: number }) => void
  ) => ipcRenderer.on('download-progress', (_e, data) => cb(data)),
  onDownloadDone: (cb: (data: { fileName: string; state: string; savePath: string }) => void) =>
    ipcRenderer.on('download-done', (_e, data) => cb(data))
}

contextBridge.exposeInMainWorld('api', api)
contextBridge.exposeInMainWorld('electron', electronAPI)
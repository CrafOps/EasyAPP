/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  // audio converter
  startConvert: (config: any) => ipcRenderer.invoke('start-conversion', config),
  selectPaths: (type: 'file' | 'folder' | 'multi') => ipcRenderer.invoke('select-paths', type),
  selectOutput: () => ipcRenderer.invoke('select-output'),
  onLog: (callback: (msg: string) => void) => {
    const subscription = (_event: IpcRendererEvent, value: string) => callback(value)
    ipcRenderer.on('conversion-log', subscription)
    return () => ipcRenderer.removeListener('conversion-log', subscription)
  },
  closeWindow: () => ipcRenderer.send('window-close'),
  minimizeWindow: () => ipcRenderer.send('window-minimize'),

  // loadpleng
  onDownloadStart: (cb: (data: { fileName: string; totalBytes: number }) => void) => ipcRenderer.on('download-start', (_e, data) => cb(data)),
  onDownloadProgress: (
    cb: (data: { fileName: string; received: number; total: number; percent: number }) => void
  ) => ipcRenderer.on('download-progress', (_e, data) => cb(data)),
  onDownloadDone: (cb: (data: { fileName: string; state: string; savePath: string }) => void) =>
    ipcRenderer.on('download-done', (_e, data) => cb(data)),

  // texture resizer
  selectJar: () => ipcRenderer.invoke('select-jar'),
  resizeTextures: (config: { jarPath: string; modid: string }) =>
    ipcRenderer.invoke('resize-textures', config),
  showInFolder: (filePath: string) => ipcRenderer.send('show-in-folder', filePath),
  onResizeLog: (cb: (msg: string) => void) => ipcRenderer.on('resize-log', (_e, msg) => cb(msg)),

  // image to item
  generateItems: (config: object) => ipcRenderer.invoke('generate-items', config),
  onItemLog: (cb: (msg: string) => void) =>
    ipcRenderer.on('item-log', (_e, msg) => cb(msg)),
}

contextBridge.exposeInMainWorld('api', api)
contextBridge.exposeInMainWorld('electron', electronAPI)
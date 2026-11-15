import { app, BrowserWindow, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'

/**
 * Auto update ผ่าน GitHub Releases (ตั้งค่า publish ไว้ใน electron-builder.yml)
 *
 * - ตรวจตอนเปิดแอป + ทุก 4 ชั่วโมง, ดาวน์โหลดเงียบๆ เบื้องหลัง
 * - โหลดเสร็จแล้ว "ไม่" ปิดแอปเอง: ให้ผู้ใช้กดรีสตาร์ทจาก sidebar
 *   ถ้าไม่กด จะติดตั้งให้ตอนปิดแอปครั้งถัดไป (autoInstallOnAppQuit)
 */

export type UpdateState =
  | 'unsupported' // dev mode / ไม่ใช่แอปที่ติดตั้ง
  | 'idle'
  | 'checking'
  | 'latest'
  | 'downloading'
  | 'ready'
  | 'error'

export interface UpdateStatus {
  state: UpdateState
  version?: string
  percent?: number
  message?: string
}

const CHECK_INTERVAL_MS = 4 * 60 * 60 * 1000

let status: UpdateStatus = { state: app.isPackaged ? 'idle' : 'unsupported' }
let getWindow: () => BrowserWindow | null = () => null

function setStatus(next: UpdateStatus): void {
  status = next
  getWindow()?.webContents.send('update-status', status)
}

async function checkForUpdates(): Promise<UpdateStatus> {
  if (!app.isPackaged) return status
  // กำลังตรวจ / กำลังโหลด / โหลดเสร็จแล้ว -> ไม่ต้องตรวจซ้ำ
  if (status.state === 'checking' || status.state === 'downloading' || status.state === 'ready') {
    return status
  }
  try {
    await autoUpdater.checkForUpdates()
  } catch {
    // event 'error' จัดการสถานะให้แล้ว
  }
  return status
}

export function initAutoUpdater(windowGetter: () => BrowserWindow | null): void {
  getWindow = windowGetter

  ipcMain.handle('update-get-status', () => status)
  ipcMain.handle('update-check', () => checkForUpdates())
  ipcMain.on('update-install', () => {
    // silent = ใช้ตัวเลือกการติดตั้งเดิม, forceRunAfter = เปิดแอปใหม่ให้หลังติดตั้ง
    if (status.state === 'ready') autoUpdater.quitAndInstall(true, true)
  })

  if (!app.isPackaged) return

  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('checking-for-update', () => setStatus({ state: 'checking' }))
  autoUpdater.on('update-not-available', () => setStatus({ state: 'latest' }))
  autoUpdater.on('update-available', (info) =>
    setStatus({ state: 'downloading', version: info.version, percent: 0 })
  )
  autoUpdater.on('download-progress', (p) =>
    setStatus({ state: 'downloading', version: status.version, percent: Math.floor(p.percent) })
  )
  autoUpdater.on('update-downloaded', (info) => setStatus({ state: 'ready', version: info.version }))
  autoUpdater.on('error', (error) => {
    console.error('AutoUpdater error:', error)
    if (status.state !== 'ready') {
      setStatus({ state: 'error', message: error?.message ?? String(error) })
    }
  })

  void checkForUpdates()
  setInterval(() => void checkForUpdates(), CHECK_INTERVAL_MS)
}

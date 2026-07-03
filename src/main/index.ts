import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import path, { join } from 'path'
import fs from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { processAudio } from './convert/converter'
import { autoUpdater } from 'electron-updater'
import { resizeJarTextures } from './resize-tex/fix-texture-ignore'
import { generateItemFiles } from './image-to-item/image-to-item'
import { destroyDiscordRPC, initDiscordRPC } from './discord'

app.commandLine.appendSwitch('disable-gpu-shader-disk-cache')
app.commandLine.appendSwitch('disable-http-cache')
let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  const width = 650
  const height = 900

  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    show: false,
    frame: true,
    resizable: false,
    titleBarStyle: 'default',
    autoHideMenuBar: true,
    fullscreenable: false,
    icon: icon,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true,
      preload: path.join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.webContents.session.on('will-download', (_event, item) => {
    const fileName = item.getFilename()
    const totalBytes = item.getTotalBytes()

    mainWindow?.webContents.send('download-start', { fileName, totalBytes })

    item.on('updated', (_e, state) => {
      if (state === 'progressing') {
        const received = item.getReceivedBytes()
        const total = item.getTotalBytes()
        const percent = total > 0 ? Math.round((received / total) * 100) : 0
        mainWindow?.webContents.send('download-progress', { fileName, received, total, percent })
      }
    })

    item.once('done', (_e, state) => {
      mainWindow?.webContents.send('download-done', {
        fileName,
        state,
        savePath: item.getSavePath()
      })
    })
  })

  mainWindow.webContents.session.setPermissionRequestHandler(
    (_webContents, permission, callback) => {
      const allowed = ['media', 'audioCapture', 'notifications']
      callback(allowed.includes(permission))
    }
  )

  app.commandLine.appendSwitch('disable-gpu-shader-disk-cache')

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

ipcMain.on('window-close', () => {
  mainWindow?.close()
})

ipcMain.on('window-minimize', () => {
  mainWindow?.minimize()
})

ipcMain.handle('start-conversion', async (event, config) => {
  const webContents = event.sender
  const win = BrowserWindow.fromWebContents(webContents)

  await processAudio(config, (msg) => {
    win?.webContents.send('conversion-log', msg)
  })
  return { status: 'success' }
})

ipcMain.handle('select-paths', async (_event, type: 'file' | 'folder' | 'multi') => {
  const options: Electron.OpenDialogOptions = {
    properties:
      type === 'folder'
        ? ['openDirectory']
        : type === 'multi'
          ? ['openFile', 'multiSelections']
          : ['openFile']
  }
  const { canceled, filePaths } = await dialog.showOpenDialog(options)
  return canceled ? null : filePaths
})

ipcMain.handle('select-output', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({ properties: ['openDirectory'] })
  return canceled ? null : filePaths[0]
})

ipcMain.handle('select-jar', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'JAR Files', extensions: ['jar'] }]
  })
  return canceled ? null : filePaths[0]
})

ipcMain.handle(
  'resize-textures',
  async (event, { jarPath, modid, maxSize, resizeThreshold, longRatio }) => {
    const webContents = event.sender
    const win = BrowserWindow.fromWebContents(webContents)

    const result = await resizeJarTextures(
      jarPath,
      modid,
      (msg) => {
        win?.webContents.send('resize-log', msg)
      },
      { maxSize, resizeThreshold, longRatio }
    )

    return result
  }
)

ipcMain.handle('generate-items', async (event, { inputPaths, inputMode, outputDir, modid, foodRegistry }) => {
  const win = BrowserWindow.fromWebContents(event.sender)

  let resolvedPaths = inputPaths
  if (inputMode === 'folder' && inputPaths[0]) {
    const folderPath = inputPaths[0]
    resolvedPaths = fs.readdirSync(folderPath)
      .filter((f: string) => f.endsWith('.png'))
      .map((f: string) => path.join(folderPath, f))
  }

  const result = await generateItemFiles(resolvedPaths, outputDir, modid, foodRegistry, (msg) => {
    win?.webContents.send('item-log', msg)
  })
  return result
})

ipcMain.on('show-in-folder', (_event, filePath: string) => {
  shell.showItemInFolder(filePath)
})

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.crafops.app')
  autoUpdater.checkForUpdatesAndNotify()
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()
  initDiscordRPC()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

autoUpdater.on('error', (error) => {
  console.error('AutoUpdater error:', error)
})

autoUpdater.on('update-not-available', () => {
  console.log('No update available')
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    destroyDiscordRPC()
    app.quit()
  }
})

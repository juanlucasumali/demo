import { app, shell, BrowserWindow, ipcMain } from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { initialize, enable } from '@electron/remote/main'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log/main'
import chokidar from 'chokidar'
import fs from 'fs/promises'
import { rm } from 'fs/promises'

// Initialize remote module
initialize()

// Configure electron-log
log.initialize({ preload: true })
log.transports.file.resolvePathFn = () => join(app.getPath('userData'), 'logs/main.log')

// Configure auto-updater
autoUpdater.logger = log
autoUpdater.autoDownload = true
autoUpdater.autoInstallOnAppQuit = true

// Add IPC handlers for updates
ipcMain.handle('check-for-updates', () => {
  if (is.dev) {
    log.info('Skipping update check in development')
    return
  }
  autoUpdater.checkForUpdates()
})

// Configure auto-updater events with proper logging
autoUpdater.on('checking-for-update', () => {
  log.info('Checking for update...')
})

autoUpdater.on('update-available', (info) => {
  log.info('Update available:', info)
  BrowserWindow.getAllWindows().forEach(window => {
    window.webContents.send('update-available', info)
  })
})

autoUpdater.on('update-not-available', (info) => {
  log.info('Update not available:', info)
})

autoUpdater.on('error', (err) => {
  log.error('Error in auto-updater:', err)
  BrowserWindow.getAllWindows().forEach(window => {
    window.webContents.send('update-error', err)
  })
})

autoUpdater.on('download-progress', (progressObj) => {
  log.info('Download progress:', progressObj)
  BrowserWindow.getAllWindows().forEach(window => {
    window.webContents.send('download-progress', progressObj)
  })
})

autoUpdater.on('update-downloaded', (info) => {
  log.info('Update downloaded:', info)
  BrowserWindow.getAllWindows().forEach(window => {
    window.webContents.send('update-downloaded', info)
  })
})

ipcMain.handle('scan-directory', async (_, directoryPath: string) => {
  const items: Array<{
    name: string
    path: string
    type: 'file' | 'folder'
    size?: number
    lastModified: Date
  }> = []

  return new Promise((resolve, reject) => {
    try {
      const watcher = chokidar.watch(directoryPath, {
        persistent: false,
        ignoreInitial: false,
        ignored: /(^|[\/\\])\../,
        depth: 99,
        followSymlinks: false,
        awaitWriteFinish: true
      })

      watcher
        .on('add', (filePath, stats) => {
          const relativePath = path.relative(directoryPath, filePath)
          items.push({
            name: path.basename(filePath),
            path: relativePath,
            type: 'file',
            size: stats?.size,
            lastModified: stats?.mtime || new Date()
          })
        })
        .on('addDir', async (dirPath) => {
          if (dirPath === directoryPath) return
          
          try {
            const stats = await fs.stat(dirPath)
            const relativePath = path.relative(directoryPath, dirPath)
            items.push({
              name: path.basename(dirPath),
              path: relativePath,
              type: 'folder',
              lastModified: stats.mtime
            })
          } catch (error) {
            console.error(`Failed to get stats for directory: ${dirPath}`, error)
          }
        })
        .on('error', (error) => {
          console.error('Error while scanning directory:', error)
          watcher.close()
          reject(error)
        })
        .on('ready', () => {
          watcher.close()
          resolve(items)
        })

    } catch (error) {
      console.error('Failed to initialize directory scan:', error)
      reject(error)
    }
  })
})

// Add these IPC handlers
ipcMain.handle('delete-directory', async (_, dirPath: string) => {
  try {
    await rm(dirPath, { recursive: true, force: true })
  } catch (error) {
    console.error('Failed to delete directory:', error)
    throw error
  }
})

ipcMain.handle('delete-file', async (_, filePath: string) => {
  try {
    await rm(filePath, { force: true })
  } catch (error) {
    console.error('Failed to delete file:', error)
    throw error
}
})

ipcMain.handle('open-external-url', (_, url) => shell.openExternal(url))

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 600,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: true,
      contextIsolation: true
    }
  })

  // Enable remote module for this window
  enable(mainWindow.webContents)

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.setZoomLevel(0) // reset to default zoom level
  })

  mainWindow.webContents.on('before-input-event', (event, input) => {
    const isMac = process.platform === 'darwin'
    const modifier = isMac ? input.meta : input.control

    const currentZoom = mainWindow.webContents.getZoomLevel()
    if (modifier && input.key === '+') {
      mainWindow.webContents.setZoomLevel(1 + currentZoom)
      event.preventDefault()
    } else if (modifier && input.key === '-') {
      mainWindow.webContents.setZoomLevel(currentZoom - 1)
      event.preventDefault()
    } else if (modifier && input.key.toLowerCase() === '0') {
      mainWindow.webContents.setZoomLevel(0)
      event.preventDefault()
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  // Check for updates
  if (!is.dev) {
    autoUpdater.checkForUpdatesAndNotify()
  }

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

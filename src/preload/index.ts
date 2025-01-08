import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { dialog } from '@electron/remote'
import fs from 'fs'
import path from 'path'

// Custom APIs for renderer
const api = {
  selectFolder: async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    return result.filePaths[0]
  },
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', callback),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', callback),
  onUpdateError: (callback) => ipcRenderer.on('update-error', callback),
  onUpdateProgress: (callback) => ipcRenderer.on('download-progress', callback),
  scanDirectory: (path: string) => ipcRenderer.invoke('scan-directory', path),
  readFile: async (filePath: string) => {
    return await fs.promises.readFile(filePath)
  },
  joinPath: async (...paths: string[]) => {
    return path.join(...paths)
  },
  createLocalDirectory: async (dirPath: string) => {
    try {
      await fs.promises.mkdir(dirPath, { recursive: true })
      return true
    } catch (error) {
      console.error('Failed to create local directory:', error)
      throw error
    }
  },
  writeLocalFile: async (filePath: string, content: Buffer) => {
    try {
      // Ensure the directory exists
      await fs.promises.mkdir(path.dirname(filePath), { recursive: true })
      await fs.promises.writeFile(filePath, content)
      return true
    } catch (error) {
      console.error('Failed to write local file:', error)
      throw error
    }
  },
  deleteDirectory: (path: string) => ipcRenderer.invoke('delete-directory', path),
  deleteFile: (path: string) => ipcRenderer.invoke('delete-file', path),
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}

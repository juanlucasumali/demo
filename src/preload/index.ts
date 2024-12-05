import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  convertToMp3: (buffer: Buffer) => ipcRenderer.invoke('convert-to-mp3', buffer)
}

// Create a separate object for electron-specific functions
const electronExposedApi = {
  ...electronAPI,
  showOpenDialog: (options: any) => ipcRenderer.invoke('show-open-dialog', options)
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronExposedApi)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronExposedApi
  // @ts-ignore (define in dts)
  window.api = api
}

import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  convertToMp3: (buffer: Buffer) => ipcRenderer.invoke('convert-to-mp3', buffer)
}

// Create a separate object for electron-specific functions
const electronExposedApi = {
  ...electronAPI,
  showOpenDialog: (options: any) => ipcRenderer.invoke('show-open-dialog', options),
  createFolderStructure: (basePath: string, folders: any[]) => 
    ipcRenderer.invoke('create-folder-structure', { basePath, folders }),
  scanDirectory: (dirPath: string) => ipcRenderer.invoke('scan-directory', dirPath), // Add this line
  readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath) // Add this line too
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

const b2Api = {
  uploadFile: (fileName: string, fileBuffer: ArrayBuffer) => 
    ipcRenderer.invoke('b2-upload-file', { fileName, fileBuffer }),
  downloadFile: (fileName: string) => 
    ipcRenderer.invoke('b2-download-file', { fileName }),
  deleteFile: (fileName: string) => 
    ipcRenderer.invoke('b2-delete-file', { fileName })
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('b2', b2Api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.b2 = b2Api
}
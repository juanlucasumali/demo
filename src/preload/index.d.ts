import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      selectFolder: () => Promise<string>
      checkForUpdates: () => Promise<void>
      onUpdateAvailable: (callback: (event: any, info: any) => void) => void
      onUpdateDownloaded: (callback: (event: any, info: any) => void) => void
      onUpdateError: (callback: (event: any, error: any) => void) => void
      onUpdateProgress: (callback: (event: any, progress: any) => void) => void
    }
  }
}

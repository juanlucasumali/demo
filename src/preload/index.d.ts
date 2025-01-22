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
      setFileTime: (filePath: string, mtime: number) => Promise<boolean>
      scanDirectory: (path: string) => Promise<Array<{
        name: string
        path: string
        type: 'file' | 'folder'
        size?: number
        lastModified: Date
      }>>
      readFile: (path: string) => Promise<Buffer>
      createLocalDirectory: (dirPath: string) => Promise<boolean>
      writeLocalFile: (filePath: string, content: Buffer) => Promise<boolean>
      joinPath: (...paths: string[]) => Promise<string>
      deleteDirectory: (path: string) => Promise<void>
      deleteFile: (path: string) => Promise<void>
    }
  }
}

export {}

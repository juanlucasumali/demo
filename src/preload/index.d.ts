import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      convertToMp3: (buffer: Buffer) => Promise<Buffer>
    }
  }
}
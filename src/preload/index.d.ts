import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI & {
      showOpenDialog: (options: {
        properties: string[];
        title?: string;
        buttonLabel?: string;
      }) => Promise<{
        canceled: boolean;
        filePaths: string[];
      }>;
      createFolderStructure: (basePath: string, folders: any[]) => Promise<{
        success: boolean;
        error?: string;
      }>;
    };
    api: {
      convertToMp3: (buffer: Buffer) => Promise<Buffer>;
    };
  }
}

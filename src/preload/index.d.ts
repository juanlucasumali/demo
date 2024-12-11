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
      scanDirectory: (dirPath: string) => Promise<Array<{
        path: string;
        name: string;
        size: number;
        type: 'file' | 'folder';
        children?: any[];
      }>>;
      readFile: (filePath: string) => Promise<Buffer>;
    };
    api: {
      convertToMp3: (buffer: Buffer) => Promise<Buffer>;
    };
    b2: {
      uploadFile: (fileName: string, fileBuffer: ArrayBuffer) => Promise<any>;
      downloadFile: (fileName: string) => Promise<ArrayBuffer>;
      deleteFile: (fileName: string) => Promise<any>;
    };
  }
}

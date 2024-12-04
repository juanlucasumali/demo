export type FileItem = {
    id: string;
    name: string;
    type: string; 
    format: string; // e.g., "WAV", "MP3"
    dateUploaded: string; // ISO date string
    size: number; // in bytes
  };

  export interface FileTreeItem {
    id: string;
    name: string;
    type: 'folder' | 'file';
    format?: string;
    size?: number;
    dateUploaded?: string;
    children?: FileTreeItem[];
  }
  
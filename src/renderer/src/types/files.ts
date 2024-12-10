export interface DatabaseItem {
  id: string;
  name: string;
  file_path: string;
  format: string;
  created_at: string;
  size?: number;
  type: string;
  parent_id: string;
}

// As seen on frontend
export type DemoItem = {
    id: string;
    name: string;
    type: string;
    format: string; // e.g., "WAV", "MP3"
    dateUploaded: string; // ISO date string
    size: number; // in bytes
    parentId: string | null;
  };

  export interface FileTreeItem {
    id: string;
    name: string;
    type: string;
    parent_id?: string;
    children?: FileTreeItem[];
    format?: string;
    size?: number;
    dateUploaded?: string;
  }
  
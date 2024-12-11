export interface DatabaseItem {
  id: string | null;
  name: string;
  format: string | null;
  type: 'file' | 'folder';
  dateUploaded: string;
  size: number;
  parentId: string | null;
  filePath: string | null;
}

export interface FileTreeItem extends DatabaseItem {
  children?: FileTreeItem[];
}

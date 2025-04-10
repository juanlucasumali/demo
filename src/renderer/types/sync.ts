import { ItemType } from "./items"

export interface LocalItem {
    name: string
    path: string
    type: 'file' | 'folder'
    size?: number
    lastModified?: Date
  }
  
  export enum SyncType {
    DAW = 'daw'
  }
  
  export interface SyncConfiguration {
    id: number
    userId: string
    localPath: string
    remoteFolderId: string
    lastSyncedAt: Date | null
    type: SyncType
  }
  
  export interface UploadProgress {
    uploadedFiles: number
    totalFiles: number
    currentFile: string
  }
  
  export interface LocalItemWithFullPath extends LocalItem {
    fullPath: string
  }

export interface RemoteItem {
  id: string;
  name: string;
  type: ItemType;
  filePath: string | null;
  localPath: string | null;
  lastModified: Date | null;
}

export interface EnhancedDiffResult {
  added: LocalItem[];      // exists in local but not in remote
  modified: LocalItem[];   // exists in both but different
  removed: RemoteItem[];   // exists in remote but not in local
}

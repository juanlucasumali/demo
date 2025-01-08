export interface LocalItem {
    name: string
    path: string
    type: 'file' | 'folder'
    size?: number
    lastModified?: Date
  }
  
  export enum SyncType {
    FL_STUDIO = 'fl-studio',
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
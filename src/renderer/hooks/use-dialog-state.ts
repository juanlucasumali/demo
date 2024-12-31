import React, { useState } from 'react'
import { DemoItem } from '@renderer/types/items'
import { UserProfile } from '@renderer/types/users'

interface SaveItemsState {
  isOpen: boolean
  from?: UserProfile
  items?: DemoItem[]
  sharedAt?: Date
  description?: string
}

export function useDialogState() {
  const [editFile, setEditFile] = useState<{ isOpen: boolean; item?: DemoItem }>({
    isOpen: false
  })
  const [share, setShare] = useState<{ isOpen: boolean; item?: DemoItem }>({
    isOpen: false
  })
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; itemId?: string }>({
    isOpen: false
  })

  const [createItem, setCreateItem] = useState<{
    isOpen: boolean
    type?: 'file' | 'folder'
    parentFolderId?: string | null
    location?: 'project' | 'home' | 'collection'
    projectId?: string | null
    collectionId?: string | null
  }>({ isOpen: false })

  const [createProject, setCreateProject] = useState<{ isOpen: boolean }>({
    isOpen: false
  })

  const [request, setRequest] = useState<{ isOpen: boolean }>({
    isOpen: false
  })

  const [saveItems, setSaveItems] = useState<SaveItemsState>({
    isOpen: false
  })

  const [selectFiles, setSelectFiles] = useState<{
    isOpen: boolean
    onConfirm?: (items: DemoItem[]) => void
    initialSelections?: DemoItem[]
    location?: 'project' | 'home' | 'save-items' | 'collection'
  }>({ isOpen: false })

  const [createCollection, setCreateCollection] = useState<{ 
    isOpen: boolean;
    projectId?: string;
  }>({
    isOpen: false
  });

  return {
    editFile: {
      ...editFile,
      onOpen: (item: DemoItem) => setEditFile({ isOpen: true, item }),
      onClose: () => setEditFile({ isOpen: false })
    },
    share: {
      ...share, 
      onOpen: (item?: DemoItem) => setShare({ isOpen: true, item: item || undefined }),
      onClose: () => setShare({ isOpen: false })
    },
    delete: {
      ...deleteDialog,
      onOpen: (itemId: string) => setDeleteDialog({ isOpen: true, itemId }),
      onClose: () => setDeleteDialog({ isOpen: false })
    },
    createItem: {
      ...createItem,
      onOpen: (type: 'file' | 'folder', parentFolderId?: string | null, location?: 'project' | 'home' | 'collection', projectId?: string | null, collectionId?: string | null) =>
        setCreateItem({ isOpen: true, type, parentFolderId, location, projectId, collectionId }),
      onClose: () => setCreateItem({ isOpen: false })
    },
    createProject: {
      ...createProject,
      onOpen: () => setCreateProject({ isOpen: true }),
      onClose: () => setCreateProject({ isOpen: false })
    },
    request: {
      ...request,
      onOpen: () => setRequest({ isOpen: true }),
      onClose: () => setRequest({ isOpen: false })
    },
    saveItems: {
      ...saveItems,
      onOpen: (from: UserProfile, items: DemoItem[], sharedAt: Date, description?: string) => 
        setSaveItems({ isOpen: true, from, items, sharedAt, description }),
      onClose: () => setSaveItems({ isOpen: false })
    },
    selectFiles: {
      ...selectFiles,
      onOpen: (config: Omit<typeof selectFiles, 'isOpen'>) => 
        setSelectFiles({ isOpen: true, ...config }),
      onClose: () => setSelectFiles({ isOpen: false })
    },
    createCollection: {
      ...createCollection,
      onOpen: (projectId: string) => setCreateCollection({ isOpen: true, projectId }),
      onClose: () => setCreateCollection({ isOpen: false })
    }
  }
} 
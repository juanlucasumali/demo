import { useState } from 'react'
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
  const [editFile, setEditFile] = useState<{ 
    isOpen: boolean
    item?: DemoItem 
  }>({
    isOpen: false
  })

  const [share, setShare] = useState<{ 
    isOpen: boolean
    item?: DemoItem 
  }>({
    isOpen: false
  })

  const [deleteDialog, setDeleteDialog] = useState<{ 
    isOpen: boolean
    item?: DemoItem 
  }>({
    isOpen: false
  })

  const [createItem, setCreateItem] = useState<{
    isOpen: boolean
    type?: 'file' | 'folder'
    parentFolderId?: string | null
    location?: 'project' | 'home' | 'collection'
    projectId?: string | null
    collectionId?: string | null
    sharedWith: UserProfile[] | null
  }>({ 
    isOpen: false,
    sharedWith: null 
  })

  const [createProject, setCreateProject] = useState<{
    isOpen: boolean
  }>({
    isOpen: false
  })

  const [request, setRequest] = useState<{
    isOpen: boolean
  }>({
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
    projectItem?: DemoItem
  }>({ 
    isOpen: false 
  })

  const [createCollection, setCreateCollection] = useState<{ 
    isOpen: boolean
    projectId?: string
  }>({
    isOpen: false
  })

  const [removeDialog, setRemoveDialog] = useState<{ 
    isOpen: boolean
    item?: DemoItem 
    location?: 'folder' | 'project' | 'collection'
  }>({
    isOpen: false
  })

  return {
  editFile: {
      ...editFile,
      onOpen: ({ item }: { item: DemoItem }) => setEditFile({ isOpen: true, item }),
      onClose: () => setEditFile({ isOpen: false })
    },
    share: {
      ...share, 
      onOpen: ({ item }: { item?: DemoItem }) => setShare({ isOpen: true, item }),
      onClose: () => setShare({ isOpen: false })
    },
    delete: {
      ...deleteDialog,
      onOpen: ({ item }: { item: DemoItem }) => setDeleteDialog({ isOpen: true, item }),
      onClose: () => setDeleteDialog({ isOpen: false })
    },
    createItem: {
      ...createItem,
      onOpen: ({ 
        type,
        parentFolderId,
        location,
        projectId,
        collectionId,
        sharedWith 
      }: {
        type: 'file' | 'folder'
        parentFolderId?: string | null
        location?: 'project' | 'home' | 'collection'
        projectId?: string | null
        collectionId?: string | null
        sharedWith?: UserProfile[] | null
      }) =>
        setCreateItem({ 
          isOpen: true, 
          type, 
          parentFolderId, 
          location, 
          projectId, 
          collectionId,
          sharedWith: sharedWith || null
        }),
      onClose: () => setCreateItem({ isOpen: false, sharedWith: null })
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
      onOpen: ({ from, items, sharedAt, description }: { 
        from: UserProfile
        items: DemoItem[]
        sharedAt: Date
        description?: string 
      }) => setSaveItems({ isOpen: true, from, items, sharedAt, description }),
      onClose: () => setSaveItems({ isOpen: false })
    },
    selectFiles: {
      ...selectFiles,
      onOpen: ({ onConfirm, initialSelections, location, projectItem }: {
        onConfirm?: (items: DemoItem[]) => void
        initialSelections?: DemoItem[]
        location?: 'project' | 'home' | 'save-items' | 'collection'
        projectItem?: DemoItem
      }) => setSelectFiles({ isOpen: true, onConfirm, initialSelections, location, projectItem }),
      onClose: () => setSelectFiles({ isOpen: false })
    },
    createCollection: {
      ...createCollection,
      onOpen: ({ projectId }: { projectId: string }) => setCreateCollection({ isOpen: true, projectId }),
      onClose: () => setCreateCollection({ isOpen: false })
    },
    remove: {
      ...removeDialog,
      onOpen: ({ item, location }: { item: DemoItem, location?: 'folder' | 'project' | 'collection' }) => 
        setRemoveDialog({ isOpen: true, item, location }),
      onClose: () => setRemoveDialog({ isOpen: false })
    }
  }
} 
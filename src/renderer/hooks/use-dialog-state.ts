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

  const [createFolder, setCreateFolder] = useState<{
    isOpen: boolean
    parentFolderId?: string | null
    location?: 'project' | 'home' | 'collection'
    projectId?: string | null
    collectionId?: string | null
    parentFolder?: DemoItem | null
    parentProject?: DemoItem | null
  }>({ 
    isOpen: false,
    parentFolder: null,
    parentProject: null
  })

  const [uploadFiles, setUploadFiles] = useState<{
    isOpen: boolean
    parentFolderId?: string | null
    location: 'project' | 'home' | 'collection' | 'folder'
    projectId?: string | null
    collectionId?: string | null
    parentFolder?: DemoItem | null
    parentProject?: DemoItem | null
    initialFiles?: File[]
  }>({
    isOpen: false,
    parentFolder: null,
    parentProject: null,
    location: 'home'
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
    collectionId?: string
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

  const [notifications, setNotifications] = useState<{
    isOpen: boolean
  }>({
    isOpen: false
  })

  const [leaveDialog, setLeaveDialog] = useState<{ 
    isOpen: boolean
    item?: DemoItem 
  }>({
    isOpen: false
  })

  const [subscription, setSubscription] = useState<{
    isOpen: boolean
  }>({
    isOpen: false
  })

  const [projectsOnboarding, setProjectsOnboarding] = useState<{
    isOpen: boolean
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
    createFolder: {
      ...createFolder,
      onOpen: ({ 
        parentFolderId,
        location,
        projectId,
        collectionId,
        parentFolder,
        parentProject,
      }: {
        parentFolderId?: string | null
        location?: 'project' | 'home' | 'collection'
        projectId?: string | null
        collectionId?: string | null
        parentFolder?: DemoItem | null
        parentProject?: DemoItem | null
      }) =>
        setCreateFolder({ 
          isOpen: true, 
          parentFolderId, 
          location, 
          projectId, 
          collectionId,
          parentFolder: parentFolder || null,
          parentProject: parentProject || null,
        }),
      onClose: () => setCreateFolder({ 
        isOpen: false, 
        parentFolder: null,
        parentProject: null 
      })
    },
    uploadFiles: {
      ...uploadFiles,
      onOpen: ({ 
        parentFolderId,
        location,
        projectId,
        collectionId,
        parentFolder,
        parentProject,
        initialFiles,
      }: {
        parentFolderId?: string | null
        location: 'project' | 'home' | 'collection' | 'folder'
        projectId?: string | null
        collectionId?: string | null
        parentFolder?: DemoItem | null
        parentProject?: DemoItem | null
        initialFiles?: File[]
      }) =>
        setUploadFiles({ 
          isOpen: true, 
          parentFolderId, 
          location, 
          projectId, 
          collectionId,
          parentFolder: parentFolder || null,
          parentProject: parentProject || null,
          initialFiles,
        }),
      onClose: () => setUploadFiles({ 
        isOpen: false, 
        parentFolder: null,
        parentProject: null,
        location: 'home'
      })
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
      onOpen: ({ onConfirm, initialSelections, location, projectItem, collectionId }: {
        onConfirm?: (items: DemoItem[]) => void
        initialSelections?: DemoItem[]
        location?: 'project' | 'home' | 'save-items' | 'collection'
        projectItem?: DemoItem
        collectionId?: string
      }) => setSelectFiles({ isOpen: true, onConfirm, initialSelections, location, projectItem, collectionId }),
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
    },
    notifications: {
      ...notifications,
      onOpen: () => setNotifications({ isOpen: true }),
      onClose: () => setNotifications({ isOpen: false })
    },
    leave: {
      ...leaveDialog,
      onOpen: ({ item }: { item: DemoItem }) => setLeaveDialog({ isOpen: true, item }),
      onClose: () => setLeaveDialog({ isOpen: false })
    },
    subscription: {
      ...subscription,
      onOpen: () => setSubscription({ isOpen: true }),
      onClose: () => setSubscription({ isOpen: false })
    },
    projectsOnboarding: {
      ...projectsOnboarding,
      onOpen: () => setProjectsOnboarding({ isOpen: true }),
      onClose: () => setProjectsOnboarding({ isOpen: false })
    }
  }
} 
import { navigation, useNavigationStore } from '@/renderer/stores/useNavigationStore'
import { useProjectsStore } from '@/renderer/stores/useProjectsStore'
import { useState, useEffect, useMemo } from 'react'
import useDialogState from '@/renderer/hooks/use-dialog-state'
import { Main } from '@/renderer/components/layout/main'
import TasksContextProvider, { ProjectDetailDialogType } from '../../tasks/context/tasks-context'
import { DataTable } from '../../tasks/components/data-table'
import { columns } from '../../tasks/components/columns'
import { PageHeader } from '@/renderer/components/layout/page-header'
import { AppHeader } from '@/renderer/components/layout/app-header'
import { ProjectItem } from '../../tasks/data/schema'
import { useProjectItemsStore } from '@/renderer/stores/useProjectItemsStore'
import { supabase } from '@/renderer/lib/supabase'
import { useProjectItemFiltering } from '@/renderer/hooks/use-project-items-filtering'
import { Alert, AlertDescription } from '@/renderer/components/ui/alert'
import { CreateFolderDialog } from './components/create-folder-dialog'
import { UploadFileDialog } from './components/upload-file-dialog'
import { PageHeaderSkeleton } from '@/renderer/components/skeletons'
import { EditFolderDialog } from './components/edit-folder-dialog'
import { EditFileDialog } from './components/edit-file-dialog'
import { DeleteProjectItemDialog } from './components/delete-project-item'

export default function ProjectDetail() {
  const { projects, isLoading: projectsLoading, fetchProjects } = useProjectsStore()
  const [currentRow, setCurrentRow] = useState<ProjectItem | null>(null)
  const [open, setOpen] = useDialogState<ProjectDetailDialogType>(null)
  const currentPath = useNavigationStore((state) => state.getCurrentPath())
  const projectId = useNavigationStore((state) => state.getCurrentProjectId())
  const project = projects.find(p => p.id === projectId)

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

    const {
      items,
      isLoading: itemsLoading,
      error,
      currentFolderId,
      fetchItems,
      displayPreferences,
      sortPreference,
      selectedTags,
      toggleStar,
      setDisplayPreferences,
      setSortPreference,
      setSelectedTags,
      setCurrentFolder,
    } = useProjectItemsStore()
  
    const [searchTerm, setSearchTerm] = useState('')
    const [editFolderDialogOpen, setEditFolderDialogOpen] = useState(false)
    const [selectedFolder, setSelectedFolder] = useState<ProjectItem | null>(null)
    const [editFileDialogOpen, setEditFileDialogOpen] = useState(false)
    const [selectedFile, setSelectedFile] = useState<ProjectItem | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [itemToDelete, setItemToDelete] = useState<ProjectItem | null>(null)
  
    const handleDelete = (item: ProjectItem) => {
      console.log("Handling delete in project details")
      setItemToDelete(item)
      setDeleteDialogOpen(true)
    }
  
    // Function to open dialog with selected folder
    const handleEditFolder = (folder: ProjectItem) => {
      setSelectedFolder(folder)
      setEditFolderDialogOpen(true)
    }
  
    // Function to close dialog
    const handleEditFolderClose = () => {
      setEditFolderDialogOpen(false)
      setSelectedFolder(null)
    }

    const handleEditFile = (file: ProjectItem) => {
      setSelectedFile(file)
      setEditFileDialogOpen(true)
    }

    useEffect(() => {
      const { projectId, folderId } = navigation.parsePathIds()
      if (projectId) {
        fetchItems(projectId, folderId)
      }
    }, [currentPath, fetchItems])

    // Set up real-time subscription
    useEffect(() => {
      if (!project?.id || !currentFolderId) return
  
      const channel = supabase
        .channel('project-items-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'project_items',
            filter: `project_id=eq.${project.id}`
          },
          () => {
            // Refresh items when any change occurs
            fetchItems(project.id, currentFolderId)
          }
        )
        .subscribe()
  
      return () => {
        supabase.removeChannel(channel)
      }
    }, [fetchItems, project?.id, currentFolderId])
  
    const allTags = useMemo(() => 
      Array.from(
        new Set(items.flatMap(item => item.tags || []))
      ).sort(),
      [items]
    )
  
    const { getFilteredAndSortedItems } = useProjectItemFiltering({
      items,
      searchTerm,
      selectedTags,
      sortPreference
    })
  
    const filteredItems = useMemo(() => {
      return getFilteredAndSortedItems()
    }, [getFilteredAndSortedItems, items, searchTerm, selectedTags, sortPreference])

    return (
      <TasksContextProvider value={{ open, setOpen, currentRow, setCurrentRow }}>
        <AppHeader />
        <Main>
          {projectsLoading && !project ? (
            // Show only PageHeader skeleton while project data is loading
            <div className="space-y-4">
              <PageHeaderSkeleton />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          ) : !project ? (
            <Alert variant="destructive">
              <AlertDescription>Project not found</AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="mb-2 flex items-center justify-between">
                <PageHeader
                  title={project.name}
                  description={project.description}
                  projectId={project.id}
                />
                <div className="flex gap-2">
                  <UploadFileDialog projectId={project.id} />
                  <CreateFolderDialog
                    projectId={project.id}
                    parentFolderId={currentFolderId}
                  />
                </div>
              </div>
              <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
                <DataTable 
                  data={items} 
                  columns={columns} 
                  isLoading={itemsLoading} 
                  onEditFolder={handleEditFolder} 
                  onEditFile={handleEditFile}
                  onDeleteFile={handleDelete}
                />
              </div>
            </>
          )}
        </Main>

        {/* ===== Dialogs ===== */}
        {selectedFolder && (
          <EditFolderDialog
            folder={selectedFolder}
            isOpen={editFolderDialogOpen}
            onClose={handleEditFolderClose}
          />
        )}

        {selectedFile && (
          <EditFileDialog
            file={selectedFile}
            isOpen={editFileDialogOpen}
            onClose={() => {
              setEditFileDialogOpen(false)
              setSelectedFile(null)
            }}
          />
        )}

        {itemToDelete && (
          <DeleteProjectItemDialog
            item={itemToDelete}
            isOpen={deleteDialogOpen}
            onClose={() => {
              setDeleteDialogOpen(false)
              setItemToDelete(null)
            }}
          />
        )}

    </TasksContextProvider>
  )
}

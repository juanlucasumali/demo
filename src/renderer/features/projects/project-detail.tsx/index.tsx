import { navigation, useNavigationStore } from '@/renderer/stores/useNavigationStore'
import { useProjectsStore } from '@/renderer/stores/useProjectsStore'
import { Project } from '@/renderer/components/layout/types'
import { useState, useEffect, useMemo } from 'react'
import { IconDownload, IconPlus } from '@tabler/icons-react'
import useDialogState from '@/renderer/hooks/use-dialog-state'
import { toast } from '@/renderer/hooks/use-toast'
import { Button } from '@/renderer/components/ui/button'
import { ConfirmDialog } from '@/renderer/components/confirm-dialog'
import { Main } from '@/renderer/components/layout/main'
import { UploadDialog } from '../../tasks/components/tasks-import-dialog'
import { ProjectItemMutateDrawer } from '../../tasks/components/tasks-mutate-drawer'
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

export default function ProjectDetail() {
  const { projects, isLoading: projectsLoading, fetchProjects } = useProjectsStore()
  const [currentRow, setCurrentRow] = useState<ProjectItem | null>(null)
  const [open, setOpen] = useDialogState<ProjectDetailDialogType>(null)
  const [type, setType] = useDialogState<"file" | "folder">(null)
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
  
    const handleFolderClick = (folderId: string) => {
      setCurrentFolder(folderId)
    }
  
    const handleBackClick = () => {
      // Logic to navigate to parent folder
      const currentItem = items.find(item => item.id === currentFolderId)
      setCurrentFolder(currentItem?.parentFolderId || null)
    }

    const isLoading = projectsLoading || itemsLoading

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
                <DataTable data={items} columns={columns} isLoading={itemsLoading}/>
              </div>
            </>
          )}
        </Main>
      {/* ===== Dialogs ===== */}

      <ProjectItemMutateDrawer
        key='task-create'
        open={open === 'create'}
        onOpenChange={() => setOpen('create')}
        type={type ?? 'file'}
      />

      <UploadDialog
        key='tasks-import'
        open={open === 'upload'}
        onOpenChange={() => setOpen('upload')}
      />

      {currentRow && (
        <>
          <ProjectItemMutateDrawer
            key={`task-update-${currentRow.id}`}
            open={open === 'update'}
            onOpenChange={() => {
              setOpen('update')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentItem={currentRow}
            type={type ?? 'file'}
          />

          <ConfirmDialog
            key='task-delete'
            destructive
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            handleConfirm={() => {
              setOpen(null)
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
              toast({
                title: 'The following task has been deleted:',
                description: (
                  <pre className='mt-2 w-[340px] rounded-md bg-slate-950 p-4'>
                    <code className='text-white'>
                      {JSON.stringify(currentRow, null, 2)}
                    </code>
                  </pre>
                ),
              })
            }}
            className='max-w-md'
            title={`Delete this task: ${currentRow.id} ?`}
            desc={
              <>
                You are about to delete a task with the ID{' '}
                <strong>{currentRow.id}</strong>. <br />
                This action cannot be undone.
              </>
            }
            confirmText='Delete'
          />
        </>
      )}
    </TasksContextProvider>
  )
}

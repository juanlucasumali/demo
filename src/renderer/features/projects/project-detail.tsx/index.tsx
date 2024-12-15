import { navigation } from '@/renderer/stores/useNavigationStore'
import { useProjectsStore } from '@/renderer/stores/useProjectsStore'
import { Project } from '@/renderer/components/layout/types'
import { useState, useEffect } from 'react'
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
import { dummyProjectItems } from '@/renderer/components/layout/data/project-item-data'
import { ProjectItem } from '../../tasks/data/schema'

export default function ProjectDetail() {
  const { projects } = useProjectsStore()
  const [project, setProject] = useState<Project | null>(null)

  useEffect(() => {
    navigation.parsePathIds()
    const projectId = navigation.getCurrentProjectId()
    const foundProject = projects.find(p => p.id === projectId)
    setProject(foundProject || null)
  }, [projects])

  // Local states
  const [currentRow, setCurrentRow] = useState<ProjectItem | null>(null)
  const [open, setOpen] = useDialogState<ProjectDetailDialogType>(null)
  const [type, setType] = useDialogState<"file" | "folder">(null)

  if (!project) {
    return <div>Project not found</div>
  }

  return (
    <TasksContextProvider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {/* ===== Top Heading ===== */}
      <AppHeader />

      {/* ===== Main ===== */}
      <Main>
        <div className='mb-2 flex items-center justify-between space-y-2 flex-wrap gap-x-4'>
          <PageHeader
            title={project.name}
            description={project.description}
            projectId={project.id}
          />
          <div className='flex gap-2'>
            <Button
              variant='outline'
              className='space-x-1'
              onClick={() => setOpen('upload')}
            >
              <span>Import</span> <IconDownload size={18} />
            </Button>
            <Button className='space-x-1' onClick={() => setOpen('create')}>
              <span>Create</span> <IconPlus size={18} />
            </Button>
          </div>
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
          <DataTable data={dummyProjectItems} columns={columns} />
        </div>
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

import { PageHeader } from '@renderer/components/page-layout/page-header'
import { Box } from 'lucide-react'
import { PageContent } from '@renderer/components/page-layout/page-content'
import { PageMain } from '@renderer/components/page-layout/page-main'
import { createFileRoute } from '@tanstack/react-router'
import { useItems } from '@renderer/hooks/use-items'
import { DataTable } from '@renderer/components/data-table/data-table'
import { createColumns } from '@renderer/components/data-table/columns'
import { Button } from '@renderer/components/ui/button'
import { useDialogState } from '@renderer/hooks/use-dialog-state'
import { DialogManager } from '@renderer/components/dialog-manager'


export const Route = createFileRoute('/projects/')({
  component: Projects,
  loader: () => ({
    breadcrumb: {
      label: 'Projects',
      id: 'projects'
    }
  })
})

export default function Projects() {
  const { projects, isLoading, updateItem, deleteItem, toggleStar } = useItems();
  const dialogState = useDialogState();

  return (
    <PageMain>
      <PageHeader
        title={'Projects'}
        icon={Box}
      >
        <Button variant="default" onClick={() => dialogState.createProject.onOpen()}>
          Create Project
        </Button>

        <Button variant="default" onClick={() => dialogState.share.onOpen({ item: undefined })}>
          Share
        </Button>
      </PageHeader>

      <PageContent>
        <DataTable
          columns={createColumns({
            enableStarToggle: true,
            enableActions: true,
            onEditFile: (item) => dialogState.editFile.onOpen({ item }),
            onShare: (item) => dialogState.share.onOpen({ item }),
            onDelete: (item) => dialogState.delete.onOpen({ item })
          })}
          data={projects}
          enableSelection={false}
          enableActions={true}
          viewMode="grid"
          pageSize={12}
          isLoading={isLoading.projects}
          onToggleStar={(id, isStarred, type) => toggleStar({ id, isStarred, type })}
        />
      </PageContent>

      <DialogManager
        {...dialogState}
        updateItem={updateItem}
        deleteItem={deleteItem}
        isLoading={isLoading}
      />
    </PageMain>
  )
}

import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { PageHeader } from '@renderer/components/page-layout/page-header'
import { PageContent } from '@renderer/components/page-layout/page-content'
import { PageMain } from '@renderer/components/page-layout/page-main'
import { Box, Upload, FileSearch, Folder } from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import { DataTable } from '@renderer/components/data-table/data-table'
import { createColumns } from '@renderer/components/data-table/columns'
import { ShareDialog } from '@renderer/components/dialogs/share-dialog'
import { useState } from 'react'
import { DemoItem, ItemType } from '@renderer/types/items'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@renderer/components/ui/dropdown-menu'
import { SelectFilesDialog } from '@renderer/components/dialogs/select-files'
import { CreateItem } from '@renderer/components/dialogs/create-item'
import { useItems } from '@renderer/hooks/use-items'
import { CollectionsSidebar } from '@renderer/components/collections/collections-sidebar'
import { useDialogState } from '@renderer/hooks/use-dialog-state'
import { DialogManager } from '@renderer/components/dialog-manager'

export const Route = createFileRoute('/projects/$projectId/collections/$collectionId/')({
  component: CollectionPage,
})

function CollectionPage() {
  const { projectId, collectionId } = useParams({ from: '/projects/$projectId/collections/$collectionId/' })
  const { currentCollection, currentProject, filesAndFolders, isLoading, removeItem, updateItem } = useItems({ collectionId, projectId })
  const dialogState = useDialogState();
  const navigate = useNavigate();

  const handleRowClick = (item: DemoItem) => {
    if (item.type === ItemType.FOLDER) {
      navigate({ to: '/home/folders/$folderId', params: { folderId: item.id!! } })
    }
  };

  // Handle loading state
  if (isLoading.currentProject || isLoading.filesAndFolders) {
    return (
      <PageMain>
        <PageHeader title="" description="" icon={Box} />
      </PageMain>
    )
  }

  // Handle case where project is not found
  if (!currentProject) {
    return (
      <PageMain>
        <PageHeader
          title="Project Not Found"
          description="The requested project could not be found."
          icon={Box}
        />
      </PageMain>
    )
  }

  return (
    <PageMain>
      <PageHeader
        title={currentProject.name}
        description={currentProject.description || 'No description provided'}
        icon={Box}
        tag={currentProject.tags}
        owner={currentProject.owner ?? undefined}
        sharedWith={currentProject.sharedWith}
      >
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="default">Add Files</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => 
                dialogState.createItem.onOpen('file', null, 'collection', projectId, collectionId)
              }>
                <Upload className="h-4 w-4 mr-2" />
                Upload file
                <DropdownMenuShortcut>⇧⌘U</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => dialogState.selectFiles.onOpen({
                location: 'collection',
                initialSelections: []
              })}>
                <FileSearch className="h-4 w-4 mr-2" />
                Choose files
                <DropdownMenuShortcut>⌘F</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => 
                dialogState.createItem.onOpen('folder', null, 'collection', projectId, collectionId)
              }>
                <Folder/>
                Create folder
                <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="default"
          onClick={() => dialogState.share.onOpen(currentProject)}
          className="flex items-center gap-2"
        >
          Share
        </Button>

        <Button
          variant="default"
          className="flex items-center gap-2"
          onClick={() => dialogState.editFile.onOpen(currentProject)}
        >
          Edit
        </Button>
      </PageHeader>

      <PageContent>
        <div className="flex gap-6 md:flex-row flex-col pt-4">
          <CollectionsSidebar 
            projectId={projectId} 
            onCreateCollection={() => dialogState.createCollection.onOpen(projectId)}
          />

          <div className="grow w-full md:w-[8rem] lg:w-[8rem]">
            <DataTable
              columns={createColumns({
                enableTags: false,
                onEditFile: dialogState.editFile.onOpen,
                onShare: dialogState.share.onOpen,
                onDelete: dialogState.delete.onOpen
              })}
              data={filesAndFolders}
              enableSelection={false}
              viewMode="table"
              pageSize={10}
              isLoading={isLoading.filesAndFolders}
              onRowClick={handleRowClick}
            />
          </div>
        </div>
      </PageContent>

      <DialogManager
        {...dialogState}
        updateItem={updateItem}
        removeItem={removeItem}
        isLoading={isLoading}
      />
    </PageMain>
  )
}
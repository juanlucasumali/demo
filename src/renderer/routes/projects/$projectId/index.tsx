import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { PageHeader } from '@renderer/components/page-layout/page-header'
import { PageContent } from '@renderer/components/page-layout/page-content'
import { PageMain } from '@renderer/components/page-layout/page-main'
import { Box, Upload, Folder } from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import { DataTable } from '@renderer/components/data-table/data-table'
import { createColumns } from '@renderer/components/data-table/columns'
import { DemoItem, ItemType } from '@renderer/types/items'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@renderer/components/ui/dropdown-menu'
import { useItems } from '@renderer/hooks/use-items'
import { CollectionsSidebar } from '@renderer/components/collections/collections-sidebar'
import { useDialogState } from '@renderer/hooks/use-dialog-state'
import { DialogManager } from '@renderer/components/dialog-manager'
import React from 'react'
import { FileDropZone } from '@renderer/components/ui/file-drop-zone'

// Define route params interface
export interface ProjectParams {
  projectId: string
}

// Create the route with params validation
export const Route = createFileRoute('/projects/$projectId/')({
  parseParams: (params): ProjectParams => ({
    projectId: params.projectId,
  }),
  component: ProjectPage,
  loader: ({ params }) => {
    // You can add data loading logic here if needed
    return {
      projectId: params.projectId,
    }
  },
})

function ProjectPage() {
  const { projectId } = useParams({ from: '/projects/$projectId/' })
  const { currentProject, filesAndFolders, isLoading, deleteItem, updateItem, bulkDelete } = useItems({ projectId })
  const dialogState = useDialogState();
  const navigate = useNavigate();

  // Create columns with useMemo to prevent recreation on every render
  const columns = React.useMemo(
    () => createColumns({
      enableTags: false,
      onEditFile: (item) => dialogState.editFile.onOpen({ item }),
      onShare: (item) => dialogState.share.onOpen({ item }),
      onDelete: (item) => dialogState.delete.onOpen({ item }),
      onRemove: (item) => dialogState.remove.onOpen({ item, location: 'project' }),
      onLeave: (item) => dialogState.leave.onOpen({ item }),
      location: 'project'
    }),
    [dialogState] // Add dependencies that the column config relies on
  );

  const handleRowClick = (item: DemoItem) => {
    if (item.type === ItemType.FOLDER) {
      navigate({ to: '/home/folders/$folderId', params: { folderId: item.id!! } })
    }
  };

  const handleFileDrop = (files: File[]) => {
    if (files.length > 0) {
      dialogState.uploadFiles.onOpen({
        initialFiles: files,
        parentFolderId: null,
        location: 'project',
        projectId,
        parentProject: currentProject
      });
    }
  };

  // Handle loading state
  if (isLoading.currentProject || isLoading.filesAndFolders) {
    return (
      <PageMain>
        <PageHeader title="" icon={Box} />
      </PageMain>
    )
  }

  // Handle case where project is not found
  if (!currentProject) {
    return (
      <PageMain>
        <PageHeader
          title="Project Not Found"
          icon={Box}
        />
      </PageMain>
    )
  }

  return (
    <PageMain>
      <PageHeader
        title={currentProject.name}
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
              <DropdownMenuItem onClick={() => dialogState.uploadFiles.onOpen({ parentFolderId: null, location: 'project', projectId, parentProject: currentProject })}>
                <Upload className="h-4 w-4 mr-2" />
                Upload file
                <DropdownMenuShortcut>⇧⌘U</DropdownMenuShortcut>
              </DropdownMenuItem>
              {/* <DropdownMenuItem onClick={() => dialogState.selectFiles.onOpen({
                location: 'project',
                initialSelections: [],
                projectItem: currentProject
              })}>
                <FileSearch className="h-4 w-4 mr-2" />
                Choose files
                <DropdownMenuShortcut>⌘F</DropdownMenuShortcut>
              </DropdownMenuItem> */}
              <DropdownMenuItem onClick={() => dialogState.createFolder.onOpen({ parentFolderId: null, location: 'project', projectId, parentProject: currentProject })}>
                <Folder/>
                Create folder
                <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="default"
          onClick={() => dialogState.share.onOpen({ item: currentProject })}
          className="flex items-center gap-2"
        >
          Share
        </Button>

        <Button
          variant="default"
          className="flex items-center gap-2"
          onClick={() => dialogState.editFile.onOpen({ item: currentProject })}
        >
          Edit
        </Button>
      </PageHeader>

      <PageContent>
        <div className="flex gap-6 md:flex-row flex-col pt-4">
          <CollectionsSidebar 
            projectId={projectId} 
            onCreateCollection={() => dialogState.createCollection.onOpen({ projectId })}
          />

          <div className="grow w-full md:w-[8rem] lg:w-[8rem]">
            <FileDropZone onFileDrop={handleFileDrop}>
              <DataTable
                columns={columns}
                data={filesAndFolders}
                enableSelection={true}
                viewMode="table"
                pageSize={10}
                isLoading={isLoading.filesAndFolders}
                onRowClick={handleRowClick}
                onBulkDelete={async (items) => {
                  const itemIds = items.map(item => item.id);
                  await bulkDelete(itemIds);
                }}
                onEditFile={(item) => dialogState.editFile.onOpen({ item })}
                onShare={(item) => dialogState.share.onOpen({ item })}
                onDelete={(item) => dialogState.delete.onOpen({ item })}
                onLeave={(item) => dialogState.leave.onOpen({ item })}
              />
            </FileDropZone>
          </div>
        </div>
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

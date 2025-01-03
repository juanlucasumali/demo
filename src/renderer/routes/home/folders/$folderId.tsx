import { Box, FolderIcon, User, UserCog } from 'lucide-react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { PageHeader } from '@renderer/components/page-layout/page-header'
import { PageContent } from '@renderer/components/page-layout/page-content'
import { PageMain } from '@renderer/components/page-layout/page-main'
import { Button } from '@renderer/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from '@renderer/components/ui/dropdown-menu'
import { DataTable } from '@renderer/components/data-table/data-table'
import { createColumns } from '@renderer/components/data-table/columns'
import { useItems } from '@renderer/hooks/use-items'
import { useNavigate } from '@tanstack/react-router'
import { ItemType } from '@renderer/types/items'
import { DemoItem } from '@renderer/types/items'
import { useDialogState } from '@renderer/hooks/use-dialog-state'
import { DialogManager } from '@renderer/components/dialog-manager'

// Define route params interface
export interface FolderParams {
  folderId: string
}

export const Route = createFileRoute('/home/folders/$folderId')({
  parseParams: (params): FolderParams => ({
    folderId: params.folderId,
  }),
  beforeLoad: async ({ context }) => {
    if (!context.auth.isAuthenticated || !context.auth.hasProfile) {
      throw redirect({
        to: '/auth',
      })
    }
  },
  component: FolderPage,
})

function FolderPage() {
  const { folderId } = Route.useParams()
  const { filesAndFolders, currentFolder, isLoading, updateItem, removeItem } = useItems({ parentFolderId: folderId });
  const dialogState = useDialogState();
  const navigate = useNavigate();

  console.log(folderId, filesAndFolders);
  
  const handleRowClick = (item: DemoItem) => {
    if (item.type === ItemType.FOLDER) {
      navigate({ to: '/home/folders/$folderId', params: { folderId: item.id!! } })
    }
  };

  return (
    <PageMain>
      <PageHeader
        title={currentFolder?.name || ""}
        description={currentFolder?.description || ""}
        icon={FolderIcon}
        owner={currentFolder?.owner || undefined}
        sharedWith={currentFolder?.sharedWith}
      >
        <Button variant="default" onClick={() => dialogState.createItem.onOpen({ type: 'file', parentFolderId: folderId, location: 'home', sharedWith: currentFolder?.sharedWith })}>
          Upload
        </Button>

        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="default">Create New</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='w-56' align='end' forceMount>
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => dialogState.createItem.onOpen({ type: 'folder', parentFolderId: folderId, location: 'home', sharedWith: currentFolder?.sharedWith })}>
                <User/> Create folder
                <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => dialogState.createProject.onOpen()}>
                <Box/> Create project
                <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => dialogState.request.onOpen()}>
              <UserCog/> Create Request
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="default" onClick={() => dialogState.share.onOpen({ item: currentFolder ?? undefined })}>
          Share
        </Button>
      </PageHeader>

      <PageContent>
        <DataTable 
          columns={createColumns({
            onEditFile: (item) => dialogState.editFile.onOpen({ item }),
            onShare: (item) => dialogState.share.onOpen({ item }),
            onDelete: (item) => dialogState.delete.onOpen({ item }),
            location: 'folder'
          })} 
          data={filesAndFolders}
          onRowClick={handleRowClick}
          isLoading={isLoading.filesAndFolders}
        />
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
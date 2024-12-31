import { Box, Folder, HomeIcon, UserCog } from 'lucide-react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { PageHeader } from '@renderer/components/page-layout/page-header'
import { PageContent } from '@renderer/components/page-layout/page-content'
import { PageMain } from '@renderer/components/page-layout/page-main'
import { Button } from '@renderer/components/ui/button'
import { Recents } from '@renderer/components/home/recents'
import { Activity } from '@renderer/components/home/activity'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@renderer/components/ui/dropdown-menu'
import { DataTable } from '@renderer/components/data-table/data-table'
import { createColumns } from '@renderer/components/data-table/columns'
import { SubHeader } from '@renderer/components/page-layout/sub-header'
import { useItems } from '@renderer/hooks/use-items'
import { useNavigate } from '@tanstack/react-router'
import { ItemType } from '@renderer/types/items'
import { DemoItem } from '@renderer/types/items'
import { useDialogState } from '@renderer/hooks/use-dialog-state'
import { DialogManager } from '@renderer/components/dialog-manager'

export const Route = createFileRoute('/home/')({
  beforeLoad: async ({ context }) => {
    if (!context.auth.isAuthenticated || !context.auth.hasProfile) {
      throw redirect({
        to: '/auth',
      })
    }
  },
  component: Home,
  loader: () => ({
    breadcrumb: 'home'
  })
})

function Home() {
  const { filesAndFolders, isLoading, updateItem, removeItem } = useItems();
  const dialogState = useDialogState();
  const navigate = useNavigate();

  const handleRowClick = (item: DemoItem) => {
    if (item.type === ItemType.FOLDER) {
      navigate({ to: '/home/folders/$folderId', params: { folderId: item.id!! } })
    }
  };

  return (
    <PageMain>
      {/* Page Header */}
      <PageHeader
        title="Home"
        description="Supercharge creativity, simplify your media."
        icon={HomeIcon}
      >
        <Button variant="default" onClick={() => dialogState.createItem.onOpen('file')}>
          Upload
        </Button>

        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="default">Create New</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='w-56' align='end' forceMount>
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => dialogState.createItem.onOpen('folder')}>
                <Folder/> Create folder
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => dialogState.createProject.onOpen()}>
                <Box/> Create project
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => dialogState.request.onOpen()}>
              <UserCog/> Create Request
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="default" onClick={() => dialogState.share.onOpen()}>
          Share
        </Button>

      </PageHeader>

      {/* Page Content */}
      <PageContent>
        <div className='lg:grid lg:grid-cols-5 gap-4 pt-8'>
          <Recents />
          <Activity />
        </div>
        <SubHeader subHeader="All files"/>
        <DataTable 
          columns={createColumns({ 
            onEditFile: dialogState.editFile.onOpen,
            onShare: dialogState.share.onOpen,
            onDelete: dialogState.delete.onOpen 
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
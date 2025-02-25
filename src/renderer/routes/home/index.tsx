import { Box, Folder, HomeIcon, UserCog } from 'lucide-react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { PageHeader } from '@renderer/components/page-layout/page-header'
import { PageContent } from '@renderer/components/page-layout/page-content'
import { PageMain } from '@renderer/components/page-layout/page-main'
import { Button } from '@renderer/components/ui/button'
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
import { FileDropZone } from '@renderer/components/ui/file-drop-zone'
import { useEffect, useState } from 'react'
import { useNotifications } from '@renderer/hooks/use-notifications'

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
  const [searchTerm, setSearchTerm] = useState('');
  
  const { 
    filesAndFolders, 
    isLoading, 
    bulkDelete,
    updateItem,
    deleteItem,
    toggleStar
  } = useItems({
    searchTerm: searchTerm || undefined
  });
  const dialogState = useDialogState();
  const navigate = useNavigate();
  const { data: notifications = [], isLoading: isLoadingNotifications } = useNotifications();

  useEffect(() => {
    if (!isLoadingNotifications && notifications.length > 0) {
      dialogState.notifications.onOpen();
    }
  }, [isLoadingNotifications, notifications.length]);

  const handleRowClick = (item: DemoItem) => {
    if (item.type === ItemType.FOLDER) {
      navigate({ to: '/home/folders/$folderId', params: { folderId: item.id!! } })
    }
  };

  const handleFileDrop = (files: File[]) => {
    if (files.length > 0) {
      dialogState.uploadFiles.onOpen({
        initialFiles: files
      });
    }
  };

  return (
    <PageMain>
      {/* Page Header */}
      <PageHeader
        title="Home"
        icon={HomeIcon}
      >
        <Button variant="default" onClick={() => dialogState.uploadFiles.onOpen({})}>
          Upload
        </Button>

        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="default">Create New</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='w-56' align='end' forceMount>
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => dialogState.createFolder.onOpen({})}>
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

        <Button variant="default" onClick={() => dialogState.share.onOpen({ item: undefined })}>
          Share
        </Button>

      </PageHeader>

      {/* Page Content */}
      <PageContent>
        <FileDropZone onFileDrop={handleFileDrop}>
          <div className='lg:grid lg:grid-cols-5 gap-4 pt-8'>
            {/* <Recents />
            <Activity /> */}
          </div>
          <SubHeader subHeader="All files"/>
          <DataTable 
            columns={createColumns({ 
              enableStarToggle: true,
              onEditFile: (item) => dialogState.editFile.onOpen({ item }),
              onShare: (item) => dialogState.share.onOpen({ item }),
              onDelete: (item) => dialogState.delete.onOpen({ item }),
              onToggleStar: (id, isStarred, type) => toggleStar({ id, isStarred, type })
            })} 
            data={filesAndFolders}
            onRowClick={handleRowClick}
            isLoading={isLoading.filesAndFolders}
            onBulkDelete={async (items) => {
              const itemIds = items.map(item => item.id);
              await bulkDelete(itemIds);
            }}
            onEditFile={(item) => dialogState.editFile.onOpen({ item })}
            onShare={(item) => dialogState.share.onOpen({ item })}
            onDelete={(item) => dialogState.delete.onOpen({ item })}
            onSearch={setSearchTerm}
          />
        </FileDropZone>
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
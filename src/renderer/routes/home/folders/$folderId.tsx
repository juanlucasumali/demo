import { Box, HomeIcon, User, UserCog } from 'lucide-react'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { PageHeader } from '@renderer/components/page-layout/page-header'
import { PageContent } from '@renderer/components/page-layout/page-content'
import { PageMain } from '@renderer/components/page-layout/page-main'
import { Button } from '@renderer/components/ui/button'
import { Recents } from '@renderer/components/home/recents'
import { Activity } from '@renderer/components/home/activity'
import { ShareDialog } from '@renderer/components/dialogs/share-dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from '@renderer/components/ui/dropdown-menu'
import { CreateProject } from '@renderer/components/dialogs/create-project'
import { RequestDialog } from '@renderer/components/dialogs/request'
import { DataTable } from '@renderer/components/data-table/data-table'
import { createColumns } from '@renderer/components/data-table/columns'
import { SubHeader } from '@renderer/components/page-layout/sub-header'
import { useItems } from '@renderer/hooks/use-items'
import { CreateItem } from '@renderer/components/dialogs/create-item'
import { useNavigate } from '@tanstack/react-router'
import { ItemType } from '@renderer/types/items'
import { DemoItem } from '@renderer/types/items'
import { supabase } from '@renderer/lib/supabase'

// Define route params interface
export interface FolderParams {
  folderId: string
}

export const Route = createFileRoute('/home/folders/$folderId')({
  component: FolderPage,
  loader: async ({ params }): Promise<{ 
    breadcrumb: { 
      label: string;
      id: string;
    }
  }> => {
    const { data: folder } = await supabase
      .from('files')
      .select('name')
      .eq('id', params.folderId)
      .single()

    return {
      breadcrumb: {
        label: folder?.name || 'Unknown Folder',
        id: params.folderId
      }
    }
  }
})

function FolderPage() {
  const { folderId } = Route.useParams()
  const { filesAndFolders, isLoading } = useItems(folderId);
  const navigate = useNavigate();
  
  const handleRowClick = (item: DemoItem) => {
    if (item.type === ItemType.FOLDER) {
      navigate({ to: '/home/folders/$folderId', params: { folderId: item.id!! } })
    }
  };

  const [createItem, setCreateItem] = useState<'file' | 'folder' | null>(null);
  const [share, setShare] = useState(false);
  const [createProject, setCreateProject] = useState(false);
  const [request, setRequest] = useState(false);

  const handleDialogClose = (dialogSetter: React.Dispatch<React.SetStateAction<boolean>>) => {
    dialogSetter(false);
  };

  return (
    <PageMain>
      {/* Page Header */}
      <PageHeader
        title="Home"
        description="Supercharge creativity, simplify your media."
        icon={HomeIcon}
      >
        {/* Header Buttons */}
        <Button variant="default" onClick={() => setCreateItem('file')}>
          Upload
        </Button>

        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="default">
              Create New
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='w-56' align='end' forceMount>
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => setCreateItem('folder')}>
                <User/>
                Create folder
                <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCreateProject(true)}>
                <Box/>
                Create project
                <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setRequest(true)}>
                <UserCog/>
                Create Request
                <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
              </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="default" onClick={() => setShare(true)}>
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
          columns={createColumns()} 
          data={filesAndFolders}
          onRowClick={handleRowClick}
          isLoading={isLoading.filesAndFolders}
        />
      </PageContent>

      {/* Dialogs */}
      <CreateItem 
        type={createItem || 'file'}
        isOpen={!!createItem}
        onClose={() => setCreateItem(null)}
        location="home"
        parentFolderId={folderId}
      />
      <ShareDialog setShare={setShare} share={share} handleDialogClose={handleDialogClose}/>
      <CreateProject setCreateProject={setCreateProject} createProject={createProject} handleDialogClose={handleDialogClose}/>
      <RequestDialog setRequest={setRequest} request={request} handleDialogClose={handleDialogClose}/>
    </PageMain>
  )
}
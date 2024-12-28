import { Box, File, HomeIcon, User, UserCog } from 'lucide-react'
import { useItemsStore } from '@renderer/stores/items-store'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { PageHeader } from '@renderer/components/page-layout/page-header'
import { PageContent } from '@renderer/components/page-layout/page-content'
import { PageMain } from '@renderer/components/page-layout/page-main'
import { Button } from '@renderer/components/ui/button'
import { UploadFile } from '@renderer/components/dialogs/upload-file'
import { CreateFolder } from '@renderer/components/dialogs/create-folder'
import { Recents } from '@renderer/components/home/recents'
import { Activity } from '@renderer/components/home/activity'
import { ShareDialog } from '@renderer/components/dialogs/share-dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from '@renderer/components/ui/dropdown-menu'
import { CreateProject } from '@renderer/components/dialogs/create-project'
import { RequestDialog } from '@renderer/components/dialogs/request'
import { DataTable } from '@renderer/components/data-table/data-table'
import { createColumns } from '@renderer/components/data-table/columns'
import { SubHeader } from '@renderer/components/page-layout/sub-header'
export const Route = createFileRoute('/home/')({
  component: Home,
})

export default function Home() {
  const filesAndFolders = useItemsStore((state) => state.filesAndFolders);

  const [upload, setUpload] = useState(false)
  const [createFolder, setCreateFolder] = useState(false)
  const [share, setShare] = useState(false)
  const [createProject, setCreateProject] = useState(false)
  const [request, setRequest] = useState(false)

  const handleDialogClose = (dialogSetter: React.Dispatch<React.SetStateAction<boolean>>) => {
    dialogSetter(false)
  }

  return (
    <PageMain>
      {/* Page Header */}
      <PageHeader
        title="Home"
        description="Supercharge creativity, simplify your media."
        icon={HomeIcon}
      >
        {/* Header Buttons */}
        <Button variant="default" onClick={() => setUpload(true)}>
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
              <DropdownMenuItem onClick={() => setCreateFolder(true)}>
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
          <Recents/>
          <Activity/>
        </div>
        <SubHeader subHeader="All files"/>
        <DataTable columns={createColumns()} data={filesAndFolders} />
      </PageContent>

      {/* Dialogs */}
      <UploadFile setUpload={setUpload} upload={upload} handleDialogClose={handleDialogClose} location="home"/>
      <CreateFolder setCreateFolder={setCreateFolder} createFolder={createFolder} handleDialogClose={handleDialogClose}/>
      <ShareDialog setShare={setShare} share={share} handleDialogClose={handleDialogClose}/>
      <CreateProject setCreateProject={setCreateProject} createProject={createProject} handleDialogClose={handleDialogClose}/>
      <RequestDialog setRequest={setRequest} request={request} handleDialogClose={handleDialogClose}/>
    </PageMain>
  )
}
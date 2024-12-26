import { columns } from '../../components/home/data-table/columns'
import { DataTable } from '../../components/home/data-table/data-table'
import { Box, HomeIcon, User, UserCog } from 'lucide-react'
import { useDataStore } from '@renderer/stores/items-store'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { PageHeader } from '@renderer/components/page/page-header'
import { PageContent } from '@renderer/components/page/page-content'
import { PageMain } from '@renderer/components/page/page-main'
import { Button } from '@renderer/components/ui/button'
import { UploadFile } from '@renderer/components/home/dialogs/upload-file'
import { CreateFolder } from '@renderer/components/home/dialogs/create-folder'
import { Recents } from '@renderer/components/home/recents'
import { Activity } from '@renderer/components/home/activity'
import { ShareDialog } from '@renderer/components/home/dialogs/share-dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from '@renderer/components/ui/dropdown-menu'
import { CreateProject } from '@renderer/components/home/dialogs/create-project'
import { RequestDialog } from '@renderer/components/home/dialogs/request'

export const Route = createFileRoute('/home/')({
  component: Home,
})

export default function Home() {
  const data = useDataStore((state) => state.data)
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
            <DropdownMenuSeparator />
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
        <DataTable columns={columns} data={data} />
      </PageContent>

      {/* Dialogs */}
      <UploadFile setUpload={setUpload} upload={upload} handleDialogClose={handleDialogClose}/>
      <CreateFolder setCreateFolder={setCreateFolder} createFolder={createFolder} handleDialogClose={handleDialogClose}/>
      <ShareDialog setShare={setShare} share={share} handleDialogClose={handleDialogClose}/>
      <CreateProject setCreateProject={setCreateProject} createProject={createProject} handleDialogClose={handleDialogClose}/>
      <RequestDialog setRequest={setRequest} request={request} handleDialogClose={handleDialogClose}/>
    </PageMain>
  )
}
import { columns } from '../../components/home/data-table/columns'
import { DataTable } from '../../components/home/data-table/data-table'
import { FilePlus, FolderPlus, HomeIcon } from 'lucide-react'
import { useDataStore } from '@renderer/stores/items-store'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { PageHeader } from '@renderer/components/page/page-header'
import { PageContent } from '@renderer/components/page/page-content'
import { PageMain } from '@renderer/components/page/page-main'
import { Dialog, DialogContent } from '@renderer/components/ui/dialog'
import { Button } from '@renderer/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@renderer/components/ui/tooltip'
import { UploadFile } from '@renderer/components/home/dialogs/upload-file'
import { CreateFolder } from '@renderer/components/home/dialogs/create-folder'
import { Recents } from '@renderer/components/home/recents'
import { Activity } from '@renderer/components/home/activity'

export const Route = createFileRoute('/home/')({
  component: Home,
})

export default function Home() {
  const data = useDataStore((state) => state.data)
  const [upload, setUpload] = useState(false)
  const [createFolder, setCreateFolder] = useState(false)

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
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="default" onClick={() => setUpload(true)}>
                <FilePlus /> Upload File
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Upload a file</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="default" onClick={() => setCreateFolder(true)}>
                <FolderPlus /> Create Folder
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Create a folder</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </PageHeader>

      {/* Page Content */}
      <PageContent>
        <div className='lg:grid lg:grid-cols-5 gap-4'>
          <Recents/>
          <Activity/>
        </div>
        <DataTable columns={columns} data={data} />
      </PageContent>

      {/* Dialogs */}
      <Dialog open={upload} onOpenChange={() => handleDialogClose(setUpload)}>
        <DialogContent>
          <UploadFile setUpload={setUpload} />
        </DialogContent>
      </Dialog>
      <Dialog open={createFolder} onOpenChange={() => handleDialogClose(setCreateFolder)}>
        <DialogContent>
          <CreateFolder setCreateFolder={setCreateFolder} />
        </DialogContent>
      </Dialog>
    </PageMain>
  )
}
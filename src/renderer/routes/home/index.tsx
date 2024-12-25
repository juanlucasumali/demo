import { columns } from '../../components/home/data-table/columns'
import { DataTable } from '../../components/home/data-table/data-table'
import { FilePlus, FolderPlus, HomeIcon, Share } from 'lucide-react'
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
import { ShareDialog } from '@renderer/components/home/dialogs/share-dialog'

export const Route = createFileRoute('/home/')({
  component: Home,
})

export default function Home() {
  const data = useDataStore((state) => state.data)
  const [upload, setUpload] = useState(false)
  const [createFolder, setCreateFolder] = useState(false)
  const [share, setShare] = useState(false)

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

        <Button variant="default" onClick={() => setCreateFolder(true)}>
          Create New
        </Button>

        <Button variant="default" onClick={() => setShare(true)}>
          Share
        </Button>

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
      <UploadFile setUpload={setUpload} upload={upload} handleDialogClose={handleDialogClose}/>
      <CreateFolder setCreateFolder={setCreateFolder} createFolder={createFolder} handleDialogClose={handleDialogClose}/>
      <ShareDialog setShare={setShare} share={share} handleDialogClose={handleDialogClose}/>
    </PageMain>
  )
}
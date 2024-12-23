import { columns } from '../../components/home/data-table/columns'
import { DataTable } from '../../components/home/data-table'
import { createFileRoute } from '@tanstack/react-router'
import { PageHeader } from '@renderer/components/page/page-header'
import { FilePlus, FolderPlus, HomeIcon, PackagePlus } from 'lucide-react'
import { PageContent } from '@renderer/components/page/page-content'
import { PageMain } from '@renderer/components/page/page-main'
import { useDataStore } from '@renderer/stores/items-store'
import { Dialog, DialogContent } from '@renderer/components/ui/dialog'
import { Button } from '@renderer/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@renderer/components/ui/tooltip'
import { useState } from 'react'

export const Route = createFileRoute('/home/')({
  component: Home,
})

export default function Home() {
  const data = useDataStore((state) => state.data)
  const [upload, setUpload] = useState<boolean>(false);
  const [createFolder, setCreateFolder] = useState<boolean>(false);
  const [createProject, setCreateProject] = useState<boolean>(false);

  return (
    <PageMain>
      <PageHeader
        title={'Home'}
        description={'Supercharge creativity, simplify your media.'}
        icon={HomeIcon}
      >
      
        {/* Upload File */}
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="default" onClick={() => setUpload(true)}>
                <FilePlus/>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
            <p>Upload a file</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {/* Create Folder */}
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="default" onClick={() => setCreateFolder(true)}>
                <FolderPlus/>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
            <p>Create a folder</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Create Project */}
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="default" onClick={() => setCreateProject(true)}>
                <PackagePlus/>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
            <p>Create a project</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

      </PageHeader>

      <PageContent>
        <DataTable columns={columns} data={data} />
      </PageContent>

      {/* Upload File */}
      <Dialog open={upload} onOpenChange={setUpload}>
        <DialogContent>
        <div>Upload File</div>
          {/* Implement Dialog */}
        </DialogContent>
      </Dialog>

      {/* Create Folder */}
      <Dialog open={createFolder} onOpenChange={setCreateFolder}>
        <DialogContent>
        <div>Create Folder</div>
          {/* Implement Dialog */}
        </DialogContent>
      </Dialog>

      {/* Create Projects */}
      <Dialog open={createProject} onOpenChange={setCreateProject}>
        <DialogContent>
          <div>Create Project</div>
          {/* Implement Dialog */}
        </DialogContent>
      </Dialog>

    </PageMain>
  )
}

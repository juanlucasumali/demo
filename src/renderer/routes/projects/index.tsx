import { PageHeader } from '@renderer/components/page-layout/page-header'
import { Box } from 'lucide-react'
import { PageContent } from '@renderer/components/page-layout/page-content'
import { PageMain } from '@renderer/components/page-layout/page-main'
import { createFileRoute } from '@tanstack/react-router'
import { useItemsStore } from '@renderer/stores/items-store'
import { DataTable } from '@renderer/components/data-table/data-table'
import { createColumns } from '@renderer/components/data-table/columns'
import { Button } from '@renderer/components/ui/button'
import { CreateProject } from '@renderer/components/dialogs/create-project'
import { ShareDialog } from '@renderer/components/dialogs/share-dialog'
import { useState } from 'react'

export const Route = createFileRoute('/projects/')({
  component: Projects,
  loader: () => ({
    breadcrumb: {
      label: 'Projects',
      id: 'projects'
    }
  })
})

export default function Projects() {
  const projects = useItemsStore((state) => state.projects);
  const [createProject, setCreateProject] = useState(false)
  const [share, setShare] = useState(false)

  const handleDialogClose = (dialogSetter: React.Dispatch<React.SetStateAction<boolean>>) => {
    dialogSetter(false)
  }

  return (
    <PageMain>
      <PageHeader
        title={'Projects'}
        description={'What will you create today?'}
        icon={Box}
      >
        <Button variant="default" onClick={() => setCreateProject(true)}>
          Create Project
        </Button>

        <Button variant="default" onClick={() => setShare(true)}>
          Share
        </Button>
      </PageHeader>

      <PageContent>
        <DataTable
          columns={createColumns({
            enableStarToggle: true,
            enableActions: true,
          })}
          data={projects}
          enableSelection={false}
          enableActions={true}
          viewMode="grid"
          pageSize={12}
        />
      </PageContent>

      {/* Dialogs */}
      <CreateProject 
        setCreateProject={setCreateProject} 
        createProject={createProject} 
        handleDialogClose={handleDialogClose}
      />
      <ShareDialog 
        setShare={setShare} 
        share={share} 
        handleDialogClose={handleDialogClose}
      />
    </PageMain>
  )
}

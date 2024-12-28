import { createFileRoute, useParams } from '@tanstack/react-router'
import { useItemsStore } from '@renderer/stores/items-store'
import { PageHeader } from '@renderer/components/page-layout/page-header'
import { PageContent } from '@renderer/components/page-layout/page-content'
import { PageMain } from '@renderer/components/page-layout/page-main'
import { Box, Share } from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import { DataTable } from '@renderer/components/data-table/data-table'
import { createColumns } from '@renderer/components/data-table/columns'
import { ShareDialog } from '@renderer/components/dialogs/share-dialog'
import { useState } from 'react'
import { DemoItem } from '@renderer/types/items'
import { EditProjectDialog } from '@renderer/components/dialogs/edit-project'

// Define route params interface
interface ProjectParams {
  projectId: string
}

// Create the route with params validation
export const Route = createFileRoute('/projects/$projectId')({
  validateSearch: (search: Record<string, unknown>): ProjectParams => {
    return {
      projectId: String(search.projectId),
    }
  },
  component: ProjectPage,
  loader: ({ params }) => {
    // You can add data loading logic here if needed
    return {
      projectId: params.projectId
    }
  },
})

function ProjectPage() {
  // Get the project ID from the route params
  const { projectId } = useParams({ from: '/projects/$projectId' })

  console.log(projectId)
  
  // Get project data from store
  const project = useItemsStore((state) => 
    state.projects.find(p => p.id === projectId)
  )

  console.log(project)
  
  const filesInProject = useItemsStore((state) => 
    state.filesAndFolders
  )

  console.log(filesInProject)

  // Dialog states
  const [share, setShare] = useState(false)
  const [editProject, setEditProject] = useState(false)
  const [itemToEdit, setItemToEdit] = useState<DemoItem | null>(null)

  const handleDialogClose = (dialogSetter: React.Dispatch<React.SetStateAction<boolean>>) => {
    dialogSetter(false)
  }

// Handle case where project is not found
  if (!project) {
    return (
      <PageMain>
        <PageHeader
          title="Project Not Found"
          description="The requested project could not be found."
          icon={Box}
        />
      </PageMain>
    )
  }

  return (
    <PageMain>
      <PageHeader
        title={project.name}
        description={project.description || "No description provided"}
        icon={Box}
      >
        <Button 
          variant="default" 
          onClick={() => setShare(true)}
          className="flex items-center gap-2"
        >
          <Share className="h-4 w-4" />
          Share
        </Button>

        <Button 
          variant="default"
          className="flex items-center gap-2"
          onClick={() => setEditProject(true)}
        >
          Edit
        </Button>
      </PageHeader>

      <PageContent>
        <DataTable
          columns={createColumns({
            enableStarToggle: true,
            enableActions: true,
          })}
          data={filesInProject}
          enableSelection={true}
          enableActions={true}
          viewMode="table"
          pageSize={10}
        />
      </PageContent>

      {/* Dialogs */}
      <ShareDialog
        setShare={setShare}
        share={share}
        handleDialogClose={handleDialogClose}
        initialItem={project as DemoItem}
      />

      <EditProjectDialog
        editProject={editProject}
        setEditProject={setEditProject}
        existingProject={project}
        handleDialogClose={handleDialogClose}
      />

    </PageMain>
  )
}

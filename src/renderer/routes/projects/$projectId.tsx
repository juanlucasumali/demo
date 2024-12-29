import { createFileRoute, useParams } from '@tanstack/react-router'
import { useItemsStore } from '@renderer/stores/items-store'
import { PageHeader } from '@renderer/components/page-layout/page-header'
import { PageContent } from '@renderer/components/page-layout/page-content'
import { PageMain } from '@renderer/components/page-layout/page-main'
import { Box, Play, Plus, Share, Upload, FileSearch } from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import { DataTable } from '@renderer/components/data-table/data-table'
import { createColumns } from '@renderer/components/data-table/columns'
import { ShareDialog } from '@renderer/components/dialogs/share-dialog'
import { useState } from 'react'
import { DemoItem } from '@renderer/types/items'
import { EditProjectDialog } from '@renderer/components/dialogs/edit-project'
import { cn } from '@renderer/lib/utils'
import { SubHeader } from '@renderer/components/page-layout/sub-header'
import { CreateCollection } from '@renderer/components/dialogs/create-collection'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuGroup, DropdownMenuShortcut, DropdownMenuTrigger } from '@renderer/components/ui/dropdown-menu'
import { UploadFile } from '@renderer/components/dialogs/upload-file'
import { SelectFilesDialog } from '@renderer/components/dialogs/select-files'

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
  const [createCollection, setCreateCollection] = useState(false)
  const [upload, setUpload] = useState(false)
  const [chooseFiles, setChooseFiles] = useState(false)
  const [selectedItems, setSelectedItems] = useState<DemoItem[]>([])

  const handleConfirmSelection = (items: DemoItem[]) => {
    setSelectedItems(items);
  };

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
        tag={project.tags}
        owner={project.owner}
        sharedWith={project.sharedWith}
      >
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="default">
              Add Files
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='w-56' align='end' forceMount>
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => setUpload(true)}>
                <Upload className="h-4 w-4 mr-2"/>
                Upload file
                <DropdownMenuShortcut>⇧⌘U</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setChooseFiles(true)}>
                <FileSearch className="h-4 w-4 mr-2"/>
                Choose files
                <DropdownMenuShortcut>⌘F</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button 
          variant="default" 
          onClick={() => setShare(true)}
          className="flex items-center gap-2"
        >
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
        <div className="flex gap-6 md:flex-row flex-col pt-4">
          {/* Navigation Sidebar */}
          <div className="w-48 flex-shrink-0">
            <div className="sticky top-0">
              <div>
                <SubHeader subHeader="Collections" />
              </div>
              <nav className="space-y-1">
                <a 
                  href="#" 
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm",
                    "rounded-md hover:bg-muted",
                    "text-muted-foreground hover:text-foreground",
                    "transition-colors"
                  )}
                >
                  <Play className="h-4 w-4" />
                  All
                </a>

                {/* New Collection Button */}
                <button
                  onClick={() => {
                    setCreateCollection(true)
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-sm",
                    "rounded-md hover:bg-muted",
                    "text-muted-foreground hover:text-foreground",
                    "transition-colors",
                    "cursor-pointer"
                  )}
                >
                  <Plus className="h-4 w-4" />
                  New Collection
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="grow w-full md:w-[8rem] lg:w-[8rem]">
            <DataTable
              columns={createColumns({
                enableTags: false 
              })}
              data={filesInProject}
              enableSelection={false}
              viewMode="table"
              pageSize={10}
            />
          </div>
        </div>
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

      <CreateCollection
        setCreateCollection={setCreateCollection}
        createCollection={createCollection}
        handleDialogClose={handleDialogClose}
      />

      <UploadFile
        setUpload={setUpload}
        upload={upload}
        handleDialogClose={handleDialogClose}
        location="project"
      />

      <SelectFilesDialog
        open={chooseFiles}
        onOpenChange={setChooseFiles}
        onConfirm={handleConfirmSelection}
        initialSelections={[]}
        location="project"
      />
    </PageMain>
  )
}

import { createFileRoute, useParams } from '@tanstack/react-router'
import { PageHeader } from '@renderer/components/page-layout/page-header'
import { PageContent } from '@renderer/components/page-layout/page-content'
import { PageMain } from '@renderer/components/page-layout/page-main'
import { Box, Play, Plus, Upload, FileSearch } from 'lucide-react'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@renderer/components/ui/dropdown-menu'
import { SelectFilesDialog } from '@renderer/components/dialogs/select-files'
import { CreateItem } from '@renderer/components/dialogs/create-item'
import { useItems } from '@renderer/hooks/use-items'

// Define route params interface
export interface ProjectParams {
  projectId: string
}

// Create the route with params validation
export const Route = createFileRoute('/projects/$projectId/')({
  parseParams: (params): ProjectParams => ({
    projectId: params.projectId,
  }),
  component: ProjectPage,
  loader: ({ params }) => {
    // You can add data loading logic here if needed
    return {
      projectId: params.projectId,
    }
  },
})

function ProjectPage() {
  const { projectId } = useParams({ from: '/projects/$projectId/' })
  const { currentProject, filesAndFolders, isLoading, removeItem, updateItem } = useItems({ projectId })

  // Dialog states
  const [share, setShare] = useState(false)
  const [editProject, setEditProject] = useState(false)
  const [createCollection, setCreateCollection] = useState(false)
  const [createItem, setCreateItem] = useState<'file' | 'folder' | null>(null)
  const [chooseFiles, setChooseFiles] = useState(false)
  const [selectedItems, setSelectedItems] = useState<DemoItem[]>([])

  const handleConfirmSelection = (items: DemoItem[]) => {
    setSelectedItems(items)
  }

  const handleDialogClose = (
    dialogSetter: React.Dispatch<React.SetStateAction<boolean>>,
  ) => {
    dialogSetter(false)
  }

  // Handle loading state
  if (isLoading.currentProject || isLoading.filesAndFolders) {
    return (
      <PageMain>
        <PageHeader
          title=""
          description=""
          icon={Box}
        />
      </PageMain>
    )
  }

  // Handle case where project is not found
  if (!currentProject) {
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
        title={currentProject.name}
        description={currentProject.description || 'No description provided'}
        icon={Box}
        tag={currentProject.tags}
        owner={currentProject.owner}
        sharedWith={currentProject.sharedWith}
      >
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="default">Add Files</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => setCreateItem('file')}>
                <Upload className="h-4 w-4 mr-2" />
                Upload file
                <DropdownMenuShortcut>⇧⌘U</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setChooseFiles(true)}>
                <FileSearch className="h-4 w-4 mr-2" />
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
                    'flex items-center gap-2 px-3 py-2 text-sm',
                    'rounded-md hover:bg-muted',
                    'text-muted-foreground hover:text-foreground',
                    'transition-colors',
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
                    'flex w-full items-center gap-2 px-3 py-2 text-sm',
                    'rounded-md hover:bg-muted',
                    'text-muted-foreground hover:text-foreground',
                    'transition-colors',
                    'cursor-pointer',
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
                enableTags: false,
                removeItem: removeItem,
                updateItem: updateItem,
              })}
              data={filesAndFolders}
              enableSelection={false}
              viewMode="table"
              pageSize={10}
              isLoading={isLoading.filesAndFolders}
            />
          </div>
        </div>
      </PageContent>

      {/* Dialogs */}
      <ShareDialog
        setShare={setShare}
        share={share}
        handleDialogClose={handleDialogClose}
        initialItem={currentProject as DemoItem}
      />

      <EditProjectDialog
        editProject={editProject}
        setEditProject={setEditProject}
        existingProject={currentProject as DemoItem}
        handleDialogClose={handleDialogClose}
      />

      <CreateCollection
        setCreateCollection={setCreateCollection}
        createCollection={createCollection}
        handleDialogClose={handleDialogClose}
      />

      <CreateItem
        type={createItem || 'file'}
        isOpen={!!createItem}
        onClose={() => setCreateItem(null)}
        location="project"
        projectId={projectId}
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

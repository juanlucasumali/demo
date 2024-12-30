import { createFileRoute, useParams } from '@tanstack/react-router'
import { PageHeader } from '@renderer/components/page-layout/page-header'
import { PageContent } from '@renderer/components/page-layout/page-content'
import { PageMain } from '@renderer/components/page-layout/page-main'
import { Box, Upload, FileSearch } from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import { DataTable } from '@renderer/components/data-table/data-table'
import { createColumns } from '@renderer/components/data-table/columns'
import { ShareDialog } from '@renderer/components/dialogs/share-dialog'
import { useState } from 'react'
import { DemoItem } from '@renderer/types/items'
import { cn } from '@renderer/lib/utils'
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
export interface CollectionParams {
  projectId: string
  collectionId: string
}

// Create the route with params validation
export const Route = createFileRoute(
  '/projects/$projectId/collections/$collectionId/',
)({
  parseParams: (params): CollectionParams => ({
    projectId: params.projectId,
    collectionId: params.collectionId,
  }),
  component: CollectionPage,
})

function CollectionPage() {
  const { projectId, collectionId } = useParams({
    from: '/projects/$projectId/$collectionId',
  })
  const { projects, filesAndFolders, isLoading } = useItems()

  // Get project data
  const project = projects.find((p) => p.id === projectId)

  // Get files associated with this collection
  const filesInCollection = filesAndFolders.filter(
    (file) =>
      file.projectId === projectId && file.collectionId === collectionId,
  )

  // Dialog states
  const [share, setShare] = useState(false)
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
  if (isLoading.projects || isLoading.filesAndFolders) {
    return (
      <PageMain>
        <PageHeader
          title="Loading..."
          description="Please wait while we load the collection details."
          icon={Box}
        />
      </PageMain>
    )
  }

  // Handle case where project or collection is not found
  if (!project) {
    return (
      <PageMain>
        <PageHeader
          title="Collection Not Found"
          description="The requested collection could not be found."
          icon={Box}
        />
      </PageMain>
    )
  }

  return (
    <PageMain>
      <PageHeader
        title={project.name} // You might want to add collection name here
        description="Collection View"
        icon={Box}
        tag={project.tags}
        owner={project.owner}
        sharedWith={project.sharedWith}
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
      </PageHeader>

      <PageContent>
        <DataTable
          columns={createColumns({
            enableTags: false,
          })}
          data={filesInCollection}
          enableSelection={false}
          viewMode="table"
          pageSize={10}
          isLoading={isLoading.filesAndFolders}
        />
      </PageContent>

      {/* Dialogs */}
      <ShareDialog
        setShare={setShare}
        share={share}
        handleDialogClose={handleDialogClose}
      />

      <CreateItem
        type={createItem || 'file'}
        isOpen={!!createItem}
        onClose={() => setCreateItem(null)}
        location="collection"
        projectId={projectId}
        collectionId={collectionId}
      />

      <SelectFilesDialog
        open={chooseFiles}
        onOpenChange={setChooseFiles}
        onConfirm={handleConfirmSelection}
        initialSelections={[]}
        location="collection"
        projectId={projectId}
        collectionId={collectionId}
      />
    </PageMain>
  )
}

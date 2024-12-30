import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { PageHeader } from '@renderer/components/page-layout/page-header'
import { PageContent } from '@renderer/components/page-layout/page-content'
import { PageMain } from '@renderer/components/page-layout/page-main'
import { Box, Upload, FileSearch, Folder } from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import { DataTable } from '@renderer/components/data-table/data-table'
import { createColumns } from '@renderer/components/data-table/columns'
import { ShareDialog } from '@renderer/components/dialogs/share-dialog'
import { useState } from 'react'
import { DemoItem, ItemType } from '@renderer/types/items'
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
import { CollectionsSidebar } from '@renderer/components/collections/collections-sidebar'

export const Route = createFileRoute('/projects/$projectId/collections/$collectionId/')({
  component: CollectionPage,
})

function CollectionPage() {
  const { projectId, collectionId } = useParams({ from: '/projects/$projectId/collections/$collectionId/' })
  const { currentCollection, currentProject, filesAndFolders, isLoading, removeItem, updateItem } = useItems({ collectionId, projectId })

  console.log(projectId, collectionId)

  console.log(currentCollection, filesAndFolders)

  // Dialog states
  const [share, setShare] = useState(false)
  const [editProject, setEditProject] = useState(false)
  const [createItem, setCreateItem] = useState<'file' | 'folder' | null>(null)
  const [chooseFiles, setChooseFiles] = useState(false)
  const [createCollection, setCreateCollection] = useState(false)
  const [selectedItems, setSelectedItems] = useState<DemoItem[]>([])
  const navigate = useNavigate()

  const handleConfirmSelection = (items: DemoItem[]) => {
    setSelectedItems(items)
  }

  const handleDialogClose = (
    dialogSetter: React.Dispatch<React.SetStateAction<boolean>>,
  ) => {
    dialogSetter(false)
  }

  const handleRowClick = (item: DemoItem) => {
    if (item.type === ItemType.FOLDER) {
      navigate({ to: '/home/folders/$folderId', params: { folderId: item.id!! } })
    }
  };


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
        owner={currentProject.owner ?? undefined}
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
              <DropdownMenuItem onClick={() => setCreateItem('folder')}>
                <Folder/>
                Create folder
                <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
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
          <CollectionsSidebar 
            projectId={projectId} 
            onCreateCollection={() => setCreateCollection(true)}
          />

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
              onRowClick={handleRowClick}
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
        location="project"
      />
    </PageMain>
  )
}
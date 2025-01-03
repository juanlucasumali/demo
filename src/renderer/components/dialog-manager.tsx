import { UseMutateFunction } from "@tanstack/react-query"
import { DemoItem } from "@renderer/types/items"
import { DeleteDialog } from "./dialogs/delete-dialog"
import { ShareDialog } from "./dialogs/share-dialog"
import { EditFileDialog } from "./dialogs/edit-file"
import { CreateItem } from "./dialogs/create-item"
import { CreateProject } from "./dialogs/create-project"
import { RequestDialog } from "./dialogs/request"
import { SaveItemsDialog } from "./dialogs/save-items-dialog"
import { SelectFilesDialog } from "./dialogs/select-files"
import { UserProfile } from "@renderer/types/users"
import { CreateCollection } from "./dialogs/create-collection"
import { RemoveDialog } from "./dialogs/remove-dialog"

interface DialogManagerProps {
  editFile: {
    isOpen: boolean
    onClose: () => void
    item?: DemoItem
  }
  share: {
    isOpen: boolean
    onClose: () => void
    item?: DemoItem
  }
  delete: {
    isOpen: boolean
    onClose: () => void
    item?: DemoItem
  }
  createItem: {
    isOpen: boolean
    onClose: () => void
    type?: 'file' | 'folder'
    parentFolderId?: string | null
    location?: 'project' | 'home' | 'collection'
    projectId?: string | null
    collectionId?: string | null
    sharedWith: UserProfile[] | null
  }
  createProject: {
    isOpen: boolean
    onClose: () => void
  }
  request: {
    isOpen: boolean
    onClose: () => void
  }
  saveItems: {
    isOpen: boolean
    onClose: () => void
    from?: UserProfile
    items?: DemoItem[]
    sharedAt?: Date
    description?: string
  }
  selectFiles: {
    isOpen: boolean
    onClose: () => void
    onConfirm?: (items: DemoItem[]) => void
    initialSelections?: DemoItem[]
    location?: 'project' | 'home' | 'save-items' | 'collection'
    projectItem?: DemoItem
  }
  updateItem?: UseMutateFunction<void, Error, { updatedItem: DemoItem, originalItem: DemoItem }, unknown>
  deleteItem?: UseMutateFunction<void, Error, string, unknown>
  isLoading: {
    deleteItem: boolean
    updateItem: boolean
  }
  createCollection: {
    isOpen: boolean
    onClose: () => void
    projectId?: string
  }
  remove: {
    isOpen: boolean
    onClose: () => void
    item?: DemoItem
    location?: 'folder' | 'project' | 'collection'
  }
}

export function DialogManager({
  editFile,
  share,
  delete: deleteDialog,
  createItem,
  createProject,
  request,
  saveItems,
  selectFiles,
  updateItem,
  deleteItem,
  isLoading,
  createCollection,
  remove
}: DialogManagerProps) {
  return (
    <>
      {editFile.item && updateItem && (
        <EditFileDialog
          editFile={editFile.isOpen}
          setEditFile={() => editFile.onClose()}
          existingFile={editFile.item}
          handleDialogClose={() => editFile.onClose()}
          updateItem={updateItem}
        />
      )}

      <ShareDialog
        open={share.isOpen}
        onOpenChange={() => share.onClose()}
        initialItem={share.item}
      />

      {deleteDialog.item && deleteItem && (
        <DeleteDialog
          open={deleteDialog.isOpen}
          onOpenChange={() => deleteDialog.onClose()}
          item={deleteDialog.item}
          deleteItem={deleteItem}
          handleDialogClose={() => deleteDialog.onClose()}
          isLoading={isLoading.deleteItem}
        />
      )}

      {createItem.type && (
        <CreateItem
          type={createItem.type}
          isOpen={createItem.isOpen}
          onClose={() => createItem.onClose()}
          location={createItem.location || 'home'}
          parentFolderId={createItem.parentFolderId}
          projectId={createItem.projectId}
          collectionId={createItem.collectionId}
          sharedWith={createItem.sharedWith}
        />
      )}

      <CreateProject
        createProject={createProject.isOpen}
        setCreateProject={() => createProject.onClose()}
        handleDialogClose={() => createProject.onClose()}
      />

      <RequestDialog
        request={request.isOpen}
        setRequest={() => request.onClose()}
        handleDialogClose={() => request.onClose()}
      />

      {saveItems.from && saveItems.items && saveItems.sharedAt && (
        <SaveItemsDialog
          open={saveItems.isOpen}
          onOpenChange={() => saveItems.onClose()}
          from={saveItems.from}
          items={saveItems.items}
          sharedAt={saveItems.sharedAt}
          description={saveItems.description || null}
        />
      )}

      <SelectFilesDialog
        open={selectFiles.isOpen}
        onOpenChange={() => selectFiles.onClose()}
        onConfirm={selectFiles.onConfirm || (() => {})}
        initialSelections={selectFiles.initialSelections}
        location={selectFiles.location || 'home'}
        projectItem={selectFiles.projectItem}
      />

      {createCollection.projectId && (
        <CreateCollection
          open={createCollection.isOpen}
          onOpenChange={() => createCollection.onClose()}
          projectId={createCollection.projectId}
        />
      )}

      {remove.item && deleteItem && (
        <RemoveDialog
          open={remove.isOpen}
          onOpenChange={() => remove.onClose()}
          item={remove.item}
          deleteItem={deleteItem}
          handleDialogClose={() => remove.onClose()}
          isLoading={isLoading.deleteItem}
          location={remove.location}
        />
      )}
    </>
  )
} 
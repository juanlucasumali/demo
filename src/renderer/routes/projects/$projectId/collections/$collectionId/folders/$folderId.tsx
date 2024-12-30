import { createFileRoute } from '@tanstack/react-router'

interface FolderParams {
  projectId: string
  collectionId: string
  folderId: string
}

export const Route = createFileRoute('/projects/$projectId/collections/$collectionId/folders/$folderId')({
  parseParams: (params): FolderParams => ({
    projectId: params.projectId,
    collectionId: params.collectionId,
    folderId: params.folderId,
  }),
  component: FolderPage,
})

function FolderPage() {
  return <div>Hello "/projects/$projectId/$collectionId/$folderId"!</div>
}

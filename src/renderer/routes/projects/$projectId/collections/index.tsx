import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/projects/$projectId/collections/')({
  component: CollectionsPage,
})

function CollectionsPage() {
  return <div>Hello "/projects/$projectId/collections/"!</div>
}

import ProjectDetail from '@/renderer/features/projects/project-detail.tsx'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/projects/$projectId/$folderId')({
  component: ProjectDetail,
})
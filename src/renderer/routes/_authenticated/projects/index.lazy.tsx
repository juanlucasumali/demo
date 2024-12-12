import { createLazyFileRoute } from '@tanstack/react-router'
import Projects from '@/renderer/features/projects'

export const Route = createLazyFileRoute('/_authenticated/projects/')({
  component: Projects,
})

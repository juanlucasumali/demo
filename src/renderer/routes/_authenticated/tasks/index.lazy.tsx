import { createLazyFileRoute } from '@tanstack/react-router'
import Tasks from '@/renderer/features/tasks'

export const Route = createLazyFileRoute('/_authenticated/tasks/')({
  component: Tasks,
})

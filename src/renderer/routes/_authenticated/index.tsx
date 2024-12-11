import { createFileRoute } from '@tanstack/react-router'
import Dashboard from '@/renderer/features/dashboard'

export const Route = createFileRoute('/_authenticated/')({
  component: Dashboard,
})

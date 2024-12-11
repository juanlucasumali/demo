import { createLazyFileRoute } from '@tanstack/react-router'
import Settings from '@/renderer/features/settings'

export const Route = createLazyFileRoute('/_authenticated/settings')({
  component: Settings,
})

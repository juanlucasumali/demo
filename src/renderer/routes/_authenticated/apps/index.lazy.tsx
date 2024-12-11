import { createLazyFileRoute } from '@tanstack/react-router'
import Apps from '@/renderer/features/apps'

export const Route = createLazyFileRoute('/_authenticated/apps/')({
  component: Apps,
})

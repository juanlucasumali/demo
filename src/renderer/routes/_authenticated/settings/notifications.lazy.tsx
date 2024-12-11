import { createLazyFileRoute } from '@tanstack/react-router'
import SettingsNotifications from '@/renderer/features/settings/notifications'

export const Route = createLazyFileRoute(
  '/_authenticated/settings/notifications'
)({
  component: SettingsNotifications,
})

import { createLazyFileRoute } from '@tanstack/react-router'
import MaintenanceError from '@/renderer/features/errors/maintenance-error'

export const Route = createLazyFileRoute('/(errors)/503')({
  component: MaintenanceError,
})

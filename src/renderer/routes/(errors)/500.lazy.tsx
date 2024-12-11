import { createLazyFileRoute } from '@tanstack/react-router'
import GeneralError from '@/renderer/features/errors/general-error'

export const Route = createLazyFileRoute('/(errors)/500')({
  component: GeneralError,
})

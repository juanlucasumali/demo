import { createFileRoute } from '@tanstack/react-router'
import CompleteProfile from '@/renderer/features/auth/complete-profile'

export const Route = createFileRoute('/(auth)/complete-profile')({
  component: CompleteProfile,
})

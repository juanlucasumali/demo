import { createFileRoute } from '@tanstack/react-router'
import VerifyEmail from '@/renderer/features/auth/verify'

export const Route = createFileRoute('/(auth)/verify')({
  component: VerifyEmail,
})

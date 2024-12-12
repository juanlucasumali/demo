import { createFileRoute } from '@tanstack/react-router'
import VerifyEmail from '@/renderer/features/auth/verify'
import { publicOnlyLoader } from '@/renderer/lib/auth'

export const Route = createFileRoute('/(auth)/verify')({
  component: VerifyEmail,
  beforeLoad: publicOnlyLoader,
})

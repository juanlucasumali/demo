import { createLazyFileRoute } from '@tanstack/react-router'
import SignUp from '@/renderer/features/auth/sign-up'

export const Route = createLazyFileRoute('/(auth)/sign-up')({
  component: SignUp,
})

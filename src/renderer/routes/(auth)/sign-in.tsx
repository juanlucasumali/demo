import { createFileRoute } from '@tanstack/react-router'
import SignIn from '@/renderer/features/auth/sign-in'

export const Route = createFileRoute('/(auth)/sign-in')({
  component: SignIn,
})

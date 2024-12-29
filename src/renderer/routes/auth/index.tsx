import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@renderer/components/ui/button'
import { useState } from 'react'
import { SignIn } from '@renderer/components/auth/signin'
import { Signup } from '@renderer/components/auth/signup'
import { VerifyEmail } from '@renderer/components/auth/verify-email'
import { AuthLayout } from '@renderer/components/auth/auth-layout'

export const Route = createFileRoute('/auth/')({
  component: AuthPage,
})

type AuthState = 'welcome' | 'signin' | 'signup' | 'verify'

export default function AuthPage() {
  const [showForm, setShowForm] = useState(false)
  const [authState, setAuthState] = useState<AuthState>('welcome')
  const [verificationEmail, setVerificationEmail] = useState<string>('')

  const renderAuthContent = () => {
    if (!showForm) {
      return (
        <>
          <h1 className="demo-logo-color text-8xl font-black tracking-tighter">Demo</h1>
          <Button 
            size="lg" 
            className="text-lg px-8 shadow-none bg-black/15"
            onClick={() => {
              setShowForm(true)
              setAuthState('signin')
            }}
          >
            Set up
          </Button>
        </>
      )
    }

    switch (authState) {
      case 'signin':
        return (
          <SignIn 
            onSwitchToSignup={() => setAuthState('signup')} 
            onUnverifiedEmail={(email) => {
              setVerificationEmail(email)
              setAuthState('verify')
            }}
          />
        )
      case 'signup':
        return (
          <Signup 
            onSwitchToSignIn={() => setAuthState('signin')}
            onEmailSubmitted={(email) => {
              setVerificationEmail(email)
              setAuthState('verify')
            }}
          />
        )
      case 'verify':
        return (
          <VerifyEmail 
            email={verificationEmail}
            onSwitchToSignIn={() => setAuthState('signin')}
            onSwitchToSignup={() => setAuthState('signup')}
          />
        )
      default:
        return null
    }
  }

  return (
    <AuthLayout>
      {renderAuthContent()}
    </AuthLayout>
  )
}

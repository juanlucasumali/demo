import { createFileRoute } from '@tanstack/react-router'
import demoAuthScreen from '@renderer/assets/demo-auth-screen.png'
import { Button } from '@renderer/components/ui/button'
import { Badge } from '@renderer/components/ui/badge'
import { useState } from 'react'
import packageJson from '../../../../package.json'
import { SignIn } from '@renderer/components/auth/signin'
import { Signup } from '@renderer/components/auth/signup'
import { VerifyEmail } from '@renderer/components/auth/verify-email'

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
    <div 
      className="h-screen w-screen flex flex-col items-center justify-center relative"
      style={{
        backgroundImage: `url(${demoAuthScreen})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute top-6 left-6 z-20">
        <Badge variant="secondary" className="bg-white/30 text-white hover:bg-black/20">
          BETA v{packageJson.version}
        </Badge>
      </div>

      <div className="absolute inset-0" />
      <div className="relative z-10 flex flex-col items-center gap-8">
        {renderAuthContent()}
      </div>
    </div>
  )
}

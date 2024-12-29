import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { Button } from '@renderer/components/ui/button'
import { Mail } from 'lucide-react'

interface VerifyEmailProps {
  email: string
  onSwitchToSignIn: () => void
  onSwitchToSignup: () => void
}

export function VerifyEmail({ email, onSwitchToSignIn, onSwitchToSignup }: VerifyEmailProps) {
  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Mail className="h-6 w-6" />
          Verify your email
        </CardTitle>
        <CardDescription>
          We've sent a verification link to {email}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <p className="text-sm text-muted-foreground">
          Please check your email and click the verification link to complete your registration.
          If you don't see the email, check your spam folder.
        </p>
        
        <div className="flex flex-col gap-2">
          <Button 
            variant="outline" 
            onClick={onSwitchToSignIn}
          >
            Back to Sign In
          </Button>
          <Button 
            variant="link"
            onClick={onSwitchToSignup}
            className="text-xs"
          >
            Use a different email
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 
import { Link } from '@tanstack/react-router'
import { Card } from '@/renderer/components/ui/card'
import { Button } from '@/renderer/components/button'
import { CheckCircle2 } from 'lucide-react'
import AuthLayout from '../auth-layout'
import { useAuth } from '@/renderer/stores/useAuthStore'
import { useState } from 'react'
import { supabase } from '@/renderer/lib/supabase'
import { useToast } from '@/renderer/hooks/use-toast'

export default function VerifyEmail() {
  const { user } = useAuth()
  const [isResending, setIsResending] = useState(false)
  const { toast } = useToast();

  const handleResendEmail = async () => {
    try {
      setIsResending(true)
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user?.email ?? '',
      })
      if (error) throw error
      toast({
        title: 'Success',
        description: 'Verification email has been resent.',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to resend verification email',
      })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <AuthLayout>
      <Card className="p-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="rounded-full bg-primary/10 p-3">
            <CheckCircle2 className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Verify your email
            </h1>
            <p className="text-sm text-muted-foreground">
              Thank you for joining Demo! <br />
              We've sent a verification email to your inbox. <br />
            </p>
          </div>
          <div className="space-y-2">
            <Button
              variant="outline"
              onClick={handleResendEmail}
              loading={isResending}
              className="w-full"
            >
              Resend verification email
            </Button>
            <p className="text-sm text-muted-foreground">
              Done with verifying?{' '}
              <Link
                to="/sign-in"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </Card>
    </AuthLayout>
  )
}
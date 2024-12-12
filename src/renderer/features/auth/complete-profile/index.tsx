import { CompleteProfileForm } from './components/complete-profile-form'
import { Card } from '@/renderer/components/ui/card'
import AuthLayout from '../auth-layout'

export default function CompleteProfile() {
  return (
    <AuthLayout>
      <Card className='p-6'>
        <div className='mb-2 flex flex-col space-y-2 text-left'>
          <h1 className='text-md font-semibold tracking-tight'>
            Complete Your Profile
          </h1>
          <p className='text-sm text-muted-foreground'>
            Just a few more details to get you started!
          </p>
        </div>
        <CompleteProfileForm />
      </Card>
    </AuthLayout>
  )
}

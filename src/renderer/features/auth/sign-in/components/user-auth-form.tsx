import { HTMLAttributes, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { cn } from '@/renderer/lib/utils'
import { useAuth, useAuthStore } from '@/renderer/stores/useAuthStore'
import { toast } from '@/renderer/hooks/use-toast'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/renderer/components/ui/form'
import { Input } from '@/renderer/components/ui/input'
import { Button } from '@/renderer/components/button'
import { PasswordInput } from '@/renderer/components/password-input'

type UserAuthFormProps = HTMLAttributes<HTMLDivElement>

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Please enter your email' })
    .email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(1, {
      message: 'Please enter your password',
    })
    .min(7, {
      message: 'Password must be at least 7 characters long',
    }),
})

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const { verifyAuth } = useAuthStore.getState()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      await signIn(data.email, data.password)
      
      toast({
        title: 'Success',
        description: 'Successfully logged in',
      })

      const hasProfile = await useAuthStore.getState().checkProfile()

      if (hasProfile) {
        await verifyAuth()
        navigate({ to: '/dashboard' })
      } else {
        navigate({ to: '/complete-profile' })
      }
    } catch (error) {
      console.log("error:", error)
      
      // Check if it's an AuthApiError and specifically about email verification
      if (
        error instanceof Error && (
          error.message.includes('Email not confirmed') ||
          error.message.includes('provider_email_needs_verification')
        )
      ) {
        toast({
          title: 'Email Verification Required',
          description: 'Please check your email for the verification link',
          // Optional: You might want to use a different variant for this case
          variant: 'default', // or 'warning' if you have that variant
        })
      } else {
        // Default error toast for other errors
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to sign in',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className='grid gap-2'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder='name@example.com' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <div className='flex items-center justify-between'>
                    <FormLabel>Password</FormLabel>
                    <Link
                      to='/forgot-password'
                      className='text-sm font-medium text-muted-foreground hover:opacity-75'
                      tabIndex={-1}
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <FormControl>
                    <PasswordInput placeholder='' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className='mt-2' loading={isLoading}>
              Login
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

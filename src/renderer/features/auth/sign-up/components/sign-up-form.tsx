import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useToast } from '@/renderer/hooks/use-toast'
import { supabase } from '@/renderer/lib/supabase'
import { Input } from '@/renderer/components/ui/input'
import { Button } from '@/renderer/components/button'
import { PasswordInput } from '@/renderer/components/password-input'
import { Label } from '@/renderer/components/ui/label'

export function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  })

  const navigate = useNavigate()
  const { toast } = useToast()

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) return 'Please enter your email'
    if (!emailRegex.test(email)) return 'Invalid email address'
    return ''
  }

  const validatePassword = (password: string) => {
    if (!password) return 'Please enter your password'
    if (password.length < 7) return 'Password must be at least 7 characters long'
    return ''
  }

  const validateConfirmPassword = (confirmPassword: string) => {
    if (confirmPassword !== password) return "Passwords don't match"
    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate fields
    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)
    const confirmPasswordError = validateConfirmPassword(confirmPassword)

    setErrors({
      email: emailError,
      password: passwordError,
      confirmPassword: confirmPasswordError
    })

    if (emailError || passwordError || confirmPasswordError) {
      return
    }

    try {
      setIsLoading(true)
      
      // Check if email exists
      const { data: emailExists } = await supabase
        .rpc('check_email_exists', { email })
      
      if (emailExists) {
        setErrors(prev => ({ ...prev, email: 'Email already exists' }))
        return
      }

      // Create user in auth
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      })

      if (signUpError) throw signUpError

      toast({
        title: 'Success',
        description: 'Please check your email to verify your account.'
      })
      navigate({ to: '/verify' })

    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create account'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className='grid gap-2'>
        <div className='space-y-1'>
          <Label>Email</Label>
          <Input
            placeholder='name@example.com'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && (
            <p className='text-sm text-destructive'>{errors.email}</p>
          )}
        </div>

        <div className='space-y-1'>
          <Label>Password</Label>
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && (
            <p className='text-sm text-destructive'>{errors.password}</p>
          )}
        </div>

        <div className='space-y-1'>
          <Label>Confirm Password</Label>
          <PasswordInput
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {errors.confirmPassword && (
            <p className='text-sm text-destructive'>{errors.confirmPassword}</p>
          )}
        </div>

        <Button className='mt-2' loading={isLoading}>
          Create Account
        </Button>
      </div>
    </form>
  )
}

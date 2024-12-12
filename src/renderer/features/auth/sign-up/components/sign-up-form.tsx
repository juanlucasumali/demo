import { HTMLAttributes, useState } from 'react'
import { cn } from '@/renderer/lib/utils'
import { useAuth } from '@/renderer/stores/authStore'
import { useNavigate } from '@tanstack/react-router'
import { useToast } from '@/renderer/hooks/use-toast'
import { supabase } from '@/renderer/lib/supabase'
import { Input } from '@/renderer/components/ui/input'
import { Button } from '@/renderer/components/button'
import { PasswordInput } from '@/renderer/components/password-input'
import { Avatar, AvatarFallback, AvatarImage } from '@/renderer/components/ui/avatar'
import { Label } from '@/renderer/components/ui/label'

type SignUpFormProps = HTMLAttributes<HTMLDivElement>

export function SignUpForm({ className, ...props }: SignUpFormProps) {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  
  // Step 1 state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    displayName: ''
  })

  // Step 2 state
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')

  const navigate = useNavigate()
  const { signUp } = useAuth()
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

  const validateUsername = (username: string) => {
    if (!username) return 'Username is required'
    if (username.length < 3) return 'Username must be at least 3 characters'
    if (username.length > 20) return 'Username must be less than 20 characters'
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Username can only contain letters, numbers, and underscores'
    return ''
  }

  const validateDisplayName = (displayName: string) => {
    if (!displayName) return 'Display name is required'
    if (displayName.length > 50) return 'Display name must be less than 50 characters'
    return ''
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setProfileImage(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate fields
    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)
    const confirmPasswordError = validateConfirmPassword(confirmPassword)

    setErrors({
      ...errors,
      email: emailError,
      password: passwordError,
      confirmPassword: confirmPasswordError
    })

    if (emailError || passwordError || confirmPasswordError) {
      return
    }

    try {
      setIsLoading(true)
      const { data: emailExists } = await supabase
        .rpc('check_email_exists', { email })
      
      if (emailExists) {
        setErrors({ ...errors, email: 'Email already exists' })
        return
      }

      setStep(2)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Something went wrong'
      })
    } finally {
      setIsLoading(false)
    }
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
  
    // Validate fields
    const usernameError = validateUsername(username)
    const displayNameError = validateDisplayName(displayName)
  
    setErrors({
      ...errors,
      username: usernameError,
      displayName: displayNameError
    })
  
    if (usernameError || displayNameError) {
      return
    }
  
    try {
      setIsLoading(true)
  
      // Check username availability
      const { data: usernameExists } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .single()
  
      if (usernameExists) {
        setErrors({ ...errors, username: 'Username already taken' })
        return
      }
  
      let profileImageUrl = null
      
      // Upload profile image if exists
      // if (profileImage) {
      //   const fileExt = profileImage.name.split('.').pop()
      //   const fileName = `${Math.random()}.${fileExt}`
      //   const filePath = `profiles/${fileName}`
  
      //   const { error: uploadError } = await supabase.storage
      //     .from('profiles') // Make sure this bucket exists in your Supabase storage
      //     .upload(filePath, profileImage)
  
      //   if (uploadError) throw uploadError
  
      //   // Get the public URL
      //   const { data: { publicUrl } } = supabase.storage
      //     .from('profiles')
      //     .getPublicUrl(filePath)
  
      //   profileImageUrl = publicUrl
      // }
  
      // Sign up user with profile data
      
      const { requiresEmailConfirmation } = await signUp(
        email, 
        password,
        {
          username,
          displayName,
          profileImage: profileImageUrl
        }
      )
  
      if (requiresEmailConfirmation) {
        toast({
          title: 'Success',
          description: 'Please check your email to verify your account.'
        })
        navigate({ to: '/verify' })
      } else {
        toast({
          title: 'Success',
          description: 'Account created successfully.'
        })
        navigate({ to: '/sign-in' })
      }
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
    <div className={cn('grid gap-6', className)} {...props}>
      {step === 1 ? (
        <form onSubmit={handleNext}>
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
              Next
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className='grid gap-4 pt-4'>
            <div className='flex flex-col items-center gap-4'>
              <Avatar className='h-24 w-24'>
                <AvatarImage src={previewUrl || ''} />
                <AvatarFallback>UP</AvatarFallback>
              </Avatar>
              <div className='grid w-full gap-1.5'>
                <Label htmlFor='picture'>Profile picture</Label>
                <Input
                  id='picture'
                  type='file'
                  accept='image/*'
                  onChange={handleImageChange}
                />
              </div>
            </div>

            <div className='space-y-1'>
              <Label>Username</Label>
              <Input
                placeholder='username'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              {errors.username && (
                <p className='text-sm text-destructive'>{errors.username}</p>
              )}
            </div>

            <div className='space-y-1'>
              <Label>Display Name</Label>
              <Input
                placeholder='Display Name'
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
              {errors.displayName && (
                <p className='text-sm text-destructive'>{errors.displayName}</p>
              )}
            </div>

            <div className='flex gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setStep(1)}
                className='w-full'
              >
                Back
              </Button>
              <Button type='submit' loading={isLoading} className='w-full'>
                Create Account
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}

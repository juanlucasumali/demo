import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useToast } from '@/renderer/hooks/use-toast'
import { supabase } from '@/renderer/lib/supabase'
import { Input } from '@/renderer/components/ui/input'
import { Button } from '@/renderer/components/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/renderer/components/ui/avatar'
import { Label } from '@/renderer/components/ui/label'
import { b2Service } from '@/renderer/services/b2'
import { useAuth, useAuthStore } from '@/renderer/stores/useAuthStore'
import { validateDisplayName, validateUsername } from '@/renderer/lib/utils'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png']
const MAX_IMAGE_DIMENSIONS = 1000 // pixels

export function CompleteProfileForm() {
  const { verifyAuth } = useAuthStore.getState()
  const [isLoading, setIsLoading] = useState(false)
  const [avatarPath, setAvatarPath] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [errors, setErrors] = useState({
    username: '',
    displayName: '',
    avatarPath: ''
  })

  const navigate = useNavigate()
  const { toast } = useToast()
  const { user } = useAuth()

  const validateImageDimensions = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.src = URL.createObjectURL(file)
      img.onload = () => {
        URL.revokeObjectURL(img.src)
        resolve(img.width <= MAX_IMAGE_DIMENSIONS && img.height <= MAX_IMAGE_DIMENSIONS)
      }
    })
  }

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setErrors(prev => ({ ...prev, avatarPath: '' }))

      if (file.size > MAX_FILE_SIZE) {
        setErrors(prev => ({ 
          ...prev, 
          avatarPath: 'File size must be less than 5MB' 
        }))
        return
      }

      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        setErrors(prev => ({ 
          ...prev, 
          avatarPath: 'File must be in JPG or PNG format' 
        }))
        return
      }

      const validDimensions = await validateImageDimensions(file)
      if (!validDimensions) {
        setErrors(prev => ({ 
          ...prev, 
          avatarPath: `Image dimensions must not exceed ${MAX_IMAGE_DIMENSIONS}x${MAX_IMAGE_DIMENSIONS} pixels` 
        }))
        return
      }

      setAvatarPath(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.id) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'User not found. Please sign in again.'
      })
      navigate({ to: '/dashboard' })
      return
    }

    const usernameError = validateUsername(username)
    const displayNameError = validateDisplayName(displayName)

    setErrors({
      ...errors,
      username: usernameError,
      displayName: displayNameError
    })

    if (usernameError || displayNameError || errors.avatarPath) {
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
        setErrors(prev => ({ ...prev, username: 'Username already taken' }))
        return
      }

      // Upload image to B2 if exists
      let avatarPathUrl = null
      if (avatarPath) {
        try {
          const uploadResult = await b2Service.uploadFile(
            avatarPath,
            user.id,
            'image',
            (hashProgress) => console.log(`Hashing: ${hashProgress}%`),
            (uploadProgress) => console.log(`Uploading: ${uploadProgress}%`)
          )
          avatarPathUrl = uploadResult.fileName
        } catch (error) {
          console.error('Failed to upload profile image:', error)
          toast({
            variant: 'destructive',
            title: 'Warning',
            description: 'Failed to upload profile picture, continuing without it'
          })
        }
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          user_id: user.id,
          username,
          display_name: displayName,
          email: user.email,
          avatar_path: avatarPathUrl
        })

      if (profileError) throw profileError

      toast({
        title: 'Success',
        description: 'Profile completed successfully'
      })

      const hasProfile = await useAuthStore.getState().checkProfile()

      if (hasProfile) {
        await verifyAuth()
        navigate({ to: '/dashboard' })
      } else {
        throw profileError
      }

    } catch (error) {
      // Cleanup uploaded image if profile creation fails
      if (avatarPath && previewUrl) {
        try {
          await b2Service.deleteFile(avatarPath.name)
        } catch (cleanupError) {
          console.error('Failed to cleanup uploaded image:', cleanupError)
        }
      }

      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to complete profile'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className='grid gap-4'>
        <div className='flex flex-col items-center gap-4'>
          <Avatar className='h-24 w-24'>
            <AvatarImage src={previewUrl || ''} />
            <AvatarFallback>
              {displayName ? displayName[0].toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className='grid w-full gap-1.5'>
            <Label htmlFor='picture'>Profile picture</Label>
            <Input
              id='picture'
              type='file'
              accept='image/*'
              onChange={handleImageChange}
            />
            {errors.avatarPath && (
              <p className='text-sm text-destructive'>{errors.avatarPath}</p>
            )}
          </div>
        </div>

        <div className='space-y-1'>
          <Label>Username</Label>
          <Input
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
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          {errors.displayName && (
            <p className='text-sm text-destructive'>{errors.displayName}</p>
          )}
        </div>

        <Button type='submit' loading={isLoading}>
          Complete Profile
        </Button>
      </div>
    </form>
  )
}

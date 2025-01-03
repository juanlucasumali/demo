import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthLayout } from '@renderer/components/auth/auth-layout'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@renderer/components/ui/form"
import { Input } from '@renderer/components/ui/input'
import { Button } from '@renderer/components/ui/button'
import { useToast } from "@renderer/hooks/use-toast"
import { useState } from "react"
import { Loader2, UserCircle } from "lucide-react"
import { useAuth } from "@renderer/context/auth-context"
import { useNavigate } from "@tanstack/react-router"
import { createProfileSchema, type CreateProfileFormData } from "@renderer/lib/validations/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@renderer/components/ui/avatar"
import { useUserStore } from "@renderer/stores/user-store"

export const Route = createFileRoute('/create-profile/')({
  beforeLoad: async ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({ to: '/auth' })
    }
    if (context.auth.hasProfile) {
      throw redirect({ to: '/home' })
    }
  },
  component: CreateProfile
})

export function CreateProfile() {
  const { user, checkProfile } = useAuth()
  const { createProfile, uploadAvatar } = useUserStore()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  
  const form = useForm<CreateProfileFormData>({
    resolver: zodResolver(createProfileSchema),
    defaultValues: {
      username: "",
      name: "",
      description: "",
      avatar: null,
    },
  })

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  async function onSubmit(data: CreateProfileFormData) {
    if (!user || !user.email) return
    
    try {
      setIsLoading(true)
      
      let avatarInfo: { b2FileId: string; fileName: string } | undefined = undefined
      if (avatarFile) {
        toast({
          title: "Uploading avatar...",
          description: "Please wait while we upload your profile picture",
        })
        
        avatarInfo = await uploadAvatar(user.id, avatarFile)
      }
      
      await createProfile({
        id: user.id,
        username: data.username,
        name: data.name,
        email: user.email,
        description: data.description || null,
        avatar: avatarInfo ? avatarInfo.b2FileId : null,
      }, avatarInfo)
  
      await checkProfile(user.id)
  
      toast({
        title: "Profile created!",
        description: "Your profile has been set up successfully",
      })
      
      setTimeout(() => {
        navigate({ to: '/home' })
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create profile",
      })
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <UserCircle className="h-6 w-6" />
            Create Profile
          </CardTitle>
          <CardDescription>
            Set up your profile to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
              <FormField
                control={form.control}
                name="avatar"
                render={() => (
                  <FormItem>
                    <div className="flex flex-col items-center space-y-2">
                      <Avatar className="h-32 w-32">
                        <AvatarImage 
                          src={avatarPreview || undefined} 
                          className="object-cover"
                          style={{ aspectRatio: '1/1' }}
                        />
                        <AvatarFallback className="text-4xl">
                          {form.watch('name')?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <label
                        htmlFor="avatar"
                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer"
                      >
                        Choose Avatar
                      </label>
                      <Input
                        id="avatar"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="johndoe" 
                        {...field} 
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="John Doe" 
                        {...field} 
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating profile...
                  </>
                ) : (
                  'Create Profile'
                )}
              </Button>
              <div className="mt-2 text-center text-sm">
                <button
                  type="button"
                  onClick={() => navigate({ to: '/auth' })}
                  className="underline underline-offset-4 hover:text-primary"
                  disabled={isLoading}
                >
                  Sign in with another account
                </button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AuthLayout>
  )
} 
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
import { supabase } from "@renderer/lib/supabase"
import { useAuth } from "@renderer/context/auth-context"
import { useNavigate } from "@tanstack/react-router"
import { createProfileSchema, type CreateProfileFormData } from "@renderer/lib/validations/auth"

export const Route = createFileRoute('/create-profile/')({
  beforeLoad: async ({ context }) => {
    // Redirect to auth if not authenticated
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/auth'
      })
    }
    // Redirect to home if already has profile
    if (context.auth.hasProfile) {
      throw redirect({
        to: '/home'
      })
    }
  },
  component: CreateProfile
})

export function CreateProfile() {
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  
  const form = useForm<CreateProfileFormData>({
    resolver: zodResolver(createProfileSchema),
    defaultValues: {
      username: "",
      name: "",
      description: "",
    },
  })

  async function onSubmit(data: CreateProfileFormData) {
    if (!user) return
    
    try {
      setIsLoading(true)
      
      const { error } = await supabase
        .from('users')
        .insert({
          id: user.id,
          username: data.username,
          name: data.name,
          description: data.description || null,
          avatar: null,
        })

      if (error) throw error

      setTimeout(() => {
        navigate({ to: '/home' })
        toast({
          title: "Profile created!",
          description: "Your profile has been set up successfully",
        })
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
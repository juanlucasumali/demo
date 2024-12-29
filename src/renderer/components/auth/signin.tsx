import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@renderer/components/ui/form"
import { Input } from '@renderer/components/ui/input'
import { Button } from '@renderer/components/ui/button'
import { useAuth } from '@renderer/context/auth-context'
import { useToast } from "@renderer/hooks/use-toast"
import { SignInFormData, signInSchema } from '@renderer/lib/validations/auth'
import { useNavigate } from '@tanstack/react-router'
import { Loader2 } from "lucide-react"
import { useState } from "react"

interface SignInProps {
  onSwitchToSignup: () => void
}

export function SignIn({ onSwitchToSignup }: SignInProps) {
  const { signIn } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  
  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(data: SignInFormData) {
    try {
      setIsLoading(true)
      await signIn(data.email, data.password)
      toast({
        title: "Welcome back!",
        description: "Successfully signed in to your account",
        variant: "default",
      })
      navigate({ to: '/home' })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: error instanceof Error ? error.message : "Failed to sign in",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle className="text-2xl">Sign In</CardTitle>
        <CardDescription>
          Enter your email below to sign in to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="m@example.com" 
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
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Password</FormLabel>
                    <a href="#" className="text-sm underline-offset-4 hover:underline">
                      Forgot your password?
                    </a>
                  </div>
                  <FormControl>
                    <Input 
                      type="password" 
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
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
            <div className="mt-2 text-center text-sm">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={onSwitchToSignup}
                className="underline underline-offset-4 hover:text-primary"
                disabled={isLoading}
              >
                Sign up
              </button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
} 
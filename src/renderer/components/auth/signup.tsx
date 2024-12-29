import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@renderer/components/ui/form"
import { Input } from '@renderer/components/ui/input'
import { Button } from '@renderer/components/ui/button'
import { useAuth } from '@renderer/context/auth-context'
import { useToast } from "@renderer/hooks/use-toast"
import { signupSchema, type SignupFormData } from '@renderer/lib/validations/auth'

interface SignupProps {
  onSwitchToSignIn: () => void
  onEmailSubmitted: (email: string) => void
}

export function Signup({ onSwitchToSignIn, onEmailSubmitted }: SignupProps) {
  const { signUp } = useAuth()
  const { toast } = useToast()
  
  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(data: SignupFormData) {
    try {
      await signUp(data.email, data.password)
      onEmailSubmitted(data.email)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create account",
      })
    }
  }

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle className="text-2xl">Create Account</CardTitle>
        <CardDescription>
          Enter your details below to create your account
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
                    <Input placeholder="m@example.com" {...field} />
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Verify Email
            </Button>
            <div className="mt-2 text-center text-sm">
              Already have an account?{" "}
              <button
                type="button"
                onClick={onSwitchToSignIn}
                className="underline underline-offset-4 hover:text-primary"
              >
                Sign In
              </button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
} 
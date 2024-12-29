import { createFileRoute } from '@tanstack/react-router'
import demoAuthScreen from '@renderer/assets/demo-auth-screen.png'
import { Button } from '@renderer/components/ui/button'
import { Badge } from '@renderer/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { Input } from '@renderer/components/ui/input'
import { useState } from 'react'
import packageJson from '../../../../package.json'
import { Label } from '@renderer/components/ui/label'

export const Route = createFileRoute('/login/')({
  component: Login,
})

export default function Login() {
  const [showLoginForm, setShowLoginForm] = useState(false)

  return (
    <div 
      className="h-screen w-screen flex flex-col items-center justify-center relative"
      style={{
        backgroundImage: `url(${demoAuthScreen})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Version Badge */}
      <div className="absolute top-6 left-6 z-20">
        <Badge variant="secondary" className="bg-white/30 text-white hover:bg-black/20">
          BETA v{packageJson.version}
        </Badge>
      </div>

      <div className="absolute inset-0" />
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {!showLoginForm ? (
          <>
            <h1 className="demo-logo-color text-8xl font-black tracking-tighter">Demo</h1>
            <Button size="lg" className="text-lg px-8 shadow-none bg-black/15" onClick={() => setShowLoginForm(true)}>
              Set up
            </Button>
          </>
        ) : (
          <Card className="w-[400px]">
            <CardHeader>
              <CardTitle className="text-2xl">Login</CardTitle>
              <CardDescription>
                Enter your email below to login to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <a
                      href="#"
                      className="text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <Input id="password" type="password" required />
                </div>
                <Button type="submit" className="w-full">
                  Login
                </Button>
                <div className="mt-2 text-center text-sm">
                  Don't have an account?{" "}
                  <a href="#" className="underline underline-offset-4">
                    Sign up
                  </a>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

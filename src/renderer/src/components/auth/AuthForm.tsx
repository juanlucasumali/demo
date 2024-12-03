import { useState } from "react"
import { supabase } from "../../lib/supabaseClient"
import { Button } from "../ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { useToast } from "@renderer/hooks/use-toast"

interface AuthFormProps {
  view: "welcome" | "login" | "signup"
  onViewChange: (view: "welcome" | "login" | "signup") => void
  onSuccess: () => void
}

export function AuthForm({ view, onViewChange, onSuccess }: AuthFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const { toast } = useToast()

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      toast({
        title: "Error logging in",
        description: error.message,
      })
    } else {
      onSuccess()
    }
  }

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
      })
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      toast({
        title: "Error signing up",
        description: error.message,
      })
    } else {
      onSuccess()
    }
  }

  if (view === "welcome") {
    return (
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome</CardTitle>
          <CardDescription>
            Please login or create an account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <Button
              onClick={() => onViewChange("login")}
              className="w-full"
            >
              Login
            </Button>
            <Button
              onClick={() => onViewChange("signup")}
              variant="outline"
              className="w-full"
            >
              Create Account
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mx-auto w-[400px]"> {/* Set fixed width */}
      <CardHeader>
        <CardTitle className="text-2xl">
          {view === "login" ? "Login" : "Create Account"}
        </CardTitle>
        <CardDescription>
          {view === "login"
            ? "Enter your credentials to login"
            : "Fill in your details to create an account"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {view === "signup" && (
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}
          <Button
            type="submit"
            className="w-full"
            onClick={view === "login" ? handleLogin : handleSignUp}
          >
            {view === "login" ? "Login" : "Create Account"}
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onViewChange("welcome")}
          >
            Back
          </Button>
        </div>
        <div className="mt-4 text-center text-sm">
          {view === "login" ? (
            <>
              Don't have an account?{" "}
              <Button
                variant="link"
                className="p-0"
                onClick={() => onViewChange("signup")}
              >
                Sign up
              </Button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Button
                variant="link"
                className="p-0"
                onClick={() => onViewChange("login")}
              >
                Login
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

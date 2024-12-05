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
import { Eye, EyeOff } from "lucide-react"

interface AuthFormProps {
  view: "welcome" | "login" | "signup" | "verify"
  onViewChange: (view: "welcome" | "login" | "signup" | "verify") => void
  onSuccess: () => void
  setEmailAddress: (emailAddress: string) => void;
}

export function AuthForm({ view, onViewChange, onSuccess, setEmailAddress }: AuthFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { toast } = useToast()

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value
    setEmail(newEmail)
    setEmailAddress(newEmail)
  }

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
      options: {
        emailRedirectTo: `${window.location.origin}`,
      },
    })
  
    if (error) {
      toast({
        title: "Error signing up",
        description: error.message,
      })
    } else {
      onViewChange("verify") // Change to verification view instead of calling onSuccess
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
              placeholder="demo@example.com"
              value={email}
              onChange={handleEmailChange}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                tabIndex={-1} 
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          {view === "signup" && (
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <div className="relative">
              <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  tabIndex={-1} 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
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

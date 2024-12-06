import { useState } from "react"
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
import { useUser } from "@renderer/hooks/useUser"

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
  const [username, setUsername] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [signupStep, setSignupStep] = useState(1)
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [usernameError, setUsernameError] = useState("")
  const [displayNameError, setDisplayNameError] = useState("")
  const { checkEmailExists, checkUsernameExists, signUp, signIn } = useUser();
  const { toast } = useToast()

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value
    setEmail(newEmail)
    setEmailAddress(newEmail)
    setEmailError("")
  }

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newPassword = e.target.value
      setPassword(newPassword)
      
      // Only show error if there's input
      if (newPassword.length > 0) {
        // Create a validation function that takes a password parameter
        const validatePasswordValue = (pass: string) => {
          if (pass.length < 8) {
            return {
              isValid: false,
              error: "Password must be at least 8 characters long"
            }
          }
          if (pass.length > 128) {
            return {
              isValid: false,
              error: "Password must be less than 128 characters long"
            }
          }
          if (!/[A-Z]/.test(pass)) {
            return {
              isValid: false,
              error: "Password must contain at least one uppercase letter"
            }
          }
          if (!/[a-z]/.test(pass)) {
            return {
              isValid: false,
              error: "Password must contain at least one lowercase letter"
            }
          }
          if (!/\d/.test(pass)) {
            return {
              isValid: false,
              error: "Password must contain at least one number"
            }
          }
          if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) {
            return {
              isValid: false,
              error: "Password must contain at least one special character"
            }
          }
          return {
            isValid: true,
            error: ""
          }
        }
    
        const validation = validatePasswordValue(newPassword)
        setPasswordError(validation.error)
      } else {
        setPasswordError("")
      }
    }
    
    const handleLogin = async () => {
      if (!email || !password) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        })
        return
      }
  
      try {
        await signIn({ email, password });
        onSuccess();
      } catch (error: any) {
        toast({
          title: "Error logging in",
          description: error.message,
          variant: "destructive"
        })
      }
    }
  
    const handleSignUp = async () => {
      if (!username || !displayName) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        })
        return
      }
  
      const isUsernameValid = await validateUsername()
      const isDisplayNameValid = validateDisplayName()
  
      if (!isUsernameValid || !isDisplayNameValid) return
  
      try {
        await signUp({
          email,
          password,
          username,
          displayName,
        });
        onViewChange("verify")
      } catch (error: any) {
        toast({
          title: "Error signing up",
          description: error.message,
        })
      }
    }

  const validateDisplayName = () => {
    if (displayName.length < 2) {
      setDisplayNameError("Display name must be at least 2 characters long")
      return false
    }
    if (displayName.length > 30) {
      setDisplayNameError("Display name must be less than 30 characters")
      return false
    }
    if (!/^[a-zA-Z0-9\s_-]+$/.test(displayName)) {
      setDisplayNameError("Display name contains invalid characters")
      return false
    }
    setDisplayNameError("")
    return true
  }

  const validateEmail = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address")
      return false
    }
  
    if (email.length > 254) {
      setEmailError("Email address is too long")
      return false
    }
  
    try {
      const exists = await checkEmailExists(email);
      if (exists) {
        setEmailError("Email already exists")
        return false
      }
      setEmailError("")
      return true
    } catch (error) {
      setEmailError("An error occurred while checking email availability")
      return false
    }
  }

  const validateUsername = async () => {
    if (username.length < 3) {
      setUsernameError("Username must be at least 3 characters long")
      return false
    }
    if (username.length > 20) {
      setUsernameError("Username must be less than 20 characters")
      return false
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setUsernameError("Username can only contain letters, numbers, and underscores")
      return false
    }

    try {
      const exists = await checkUsernameExists(username);
      if (exists) {
        setUsernameError("Username already exists")
        return false
      }
      setUsernameError("")
      return true
    } catch (error) {
      setUsernameError("An error occurred while checking username availability")
      return false
    }
  }
  
  const handleNextStep = async () => {
    // Check if all required fields are filled
    if (!email || !password || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }
  
    // Check if passwords match
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      })
      return
    }
    
    // Validate email last (since it involves an async operation)
    const isEmailValid = await validateEmail()
    if (!isEmailValid) {
      return
    }
  
    // If all validations pass, proceed to next step
    setSignupStep(2)
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

  if (view === "login") {
    return (
      <Card className="mx-auto w-[400px]">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your credentials to login
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
                  onChange={handlePasswordChange} // Use the new handler
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full"
              onClick={handleLogin}
            >
              Login
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onViewChange("welcome")}
            >
              Back
            </Button>
            <div className="mt-4 text-center text-sm">
              Don't have an account?{" "}
              <Button
                variant="link"
                className="p-0"
                onClick={() => onViewChange("signup")}
              >
                Sign up
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (view === "signup") {
    return (
      <Card className="mx-auto w-[400px]">
        <CardHeader>
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>
            {signupStep === 1 ? "Step 1: Enter your email and password" : "Step 2: Choose your username and display name"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
          {signupStep === 1 ? (
            <>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  required
                />
                {emailError && <span className="text-red-500 text-sm">{emailError}</span>}
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
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
                {passwordError && <span className="text-red-500 text-sm">{passwordError}</span>}
              </div>

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
                {password !== confirmPassword && confirmPassword !== "" && (
                  <span className="text-red-500 text-sm">Passwords do not match</span>
                )}
              </div>

              <Button onClick={handleNextStep}>Next</Button>
              <Button variant="outline" onClick={() => onViewChange("welcome")}>Back</Button>
            </>
          ) : (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value)
                      setUsernameError("")
                    }}
                    required
                  />
                  {usernameError && <span className="text-red-500 text-sm">{usernameError}</span>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => {
                      setDisplayName(e.target.value)
                      setDisplayNameError("")
                    }}
                    required
                  />
                  {displayNameError && <span className="text-red-500 text-sm">{displayNameError}</span>}
                </div>
                <Button onClick={handleSignUp}>Create Account</Button>
                <Button variant="outline" onClick={() => setSignupStep(1)}>Back</Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }
  return (
    <Card className="mx-auto w-[400px]">
      <CardHeader>
        <CardTitle className="text-2xl">Oops! Something went wrong...</CardTitle>
        <CardDescription>
          Invalid view state
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => onViewChange("welcome")}
        >
          Back to Welcome
        </Button>
      </CardContent>
    </Card>
  )
}
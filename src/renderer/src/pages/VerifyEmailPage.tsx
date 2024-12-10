import { FC } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { ArrowLeft } from "lucide-react"

export const VerifyEmailPage: FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as { emailAddress: string } | undefined
  const emailAddress = state?.emailAddress || "your email"

  return (
    <Card className="mx-auto w-[400px]">
      <CardHeader>
        <CardTitle className="text-2xl">Verify Your Email</CardTitle>
        <CardDescription>
          Thanks for signing up! A verification link was sent to{" "}
          <span className="font-bold">{emailAddress}</span>.
          After clicking on the link, log in with your new account details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 mb-4">
          If you don't see the email, check your spam folder.
        </p>
        <div className="space-y-2">
            <Button onClick={() => navigate("/login")} className="w-full">
            Login
          </Button>
          <Button
            onClick={() => navigate("/signup")}
            className="w-full"
            variant="ghost"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Wrong email? Click to go back.
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

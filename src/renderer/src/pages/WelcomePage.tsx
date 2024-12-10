import { FC } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"

export const WelcomePage: FC = () => {
  const navigate = useNavigate()
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
          <Button onClick={() => navigate("/login")} className="w-full">
            Login
          </Button>
          <Button onClick={() => navigate("/signup")} variant="outline" className="w-full">
            Create Account
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

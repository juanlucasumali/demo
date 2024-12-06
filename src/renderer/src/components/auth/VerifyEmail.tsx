import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { RefreshCw, ArrowLeft } from "lucide-react" // Added ArrowLeft icon

interface VerifyEmailProps {
  emailAddress: string;
  onBack: () => void;
}

export function VerifyEmail({ emailAddress, onBack }: VerifyEmailProps) {
  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <Card className="mx-auto w-[400px]">
      <CardHeader>
        <CardTitle className="text-2xl">Verify Your Email</CardTitle>
        <CardDescription>
          Thanks for signing up! A verification link was sent to{" "}
          <span className="font-bold">{emailAddress}</span>. 
          After clicking on the link, reload this page and log in with your new account details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 mb-4">
          If you don't see the email, check your spam folder.
        </p>
        <div className="space-y-2">
          <Button 
            onClick={handleRefresh}
            className="w-full"
            variant="outline"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Page
          </Button>
          <Button
            onClick={onBack}
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

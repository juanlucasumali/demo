import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"

export function VerifyEmail() {
  return (
    <Card className="mx-auto w-[400px]">
      <CardHeader>
        <CardTitle className="text-2xl">Verify Your Email</CardTitle>
        <CardDescription>
          Please check your email for a verification link. After clicking on the link, reload this page.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500">
          If you don't see the email, check your spam folder.
        </p>
      </CardContent>
    </Card>
  )
}

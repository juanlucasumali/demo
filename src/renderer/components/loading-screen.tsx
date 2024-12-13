import { Loader2 } from "lucide-react"
import { CardContent } from "./ui/card"

export function LoadingScreen() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-background">
        <CardContent className="flex flex-col items-center gap-4 pt-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
    </div>
  )
}

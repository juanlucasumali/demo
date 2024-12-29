import demoAuthScreen from '@renderer/assets/demo-auth-screen.png'
import { Badge } from '@renderer/components/ui/badge'
import packageJson from '../../../../package.json'

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div 
      className="h-screen w-screen flex flex-col items-center justify-center relative"
      style={{
        backgroundImage: `url(${demoAuthScreen})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute top-6 left-6 z-20">
        <Badge variant="secondary" className="hover:bg-white/30 text-white bg-black/20">
          BETA v{packageJson.version}
        </Badge>
      </div>
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4">
        {children}
      </div>
    </div>
  )
} 
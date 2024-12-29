import { createFileRoute } from '@tanstack/react-router'
import demoAuthScreen from '@renderer/assets/demo-auth-screen.png'
import { Button } from '@renderer/components/ui/button'
import { Badge } from '@renderer/components/ui/badge'
import packageJson from '../../../../package.json'

export const Route = createFileRoute('/login/')({
  component: Login,
})

export default function Login() {
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

      {/* Dark overlay */}
      <div className="absolute inset-0" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        <h1 className="demo-logo-color text-8xl font-black tracking-tighter">Demo</h1>
        <Button size="lg" className="text-lg px-8 shadow-none bg-black/15">
          Set up
        </Button>
      </div>
    </div>
  )
}

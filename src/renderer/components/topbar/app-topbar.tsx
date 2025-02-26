import { SidebarTrigger } from '../ui/sidebar'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../ui/breadcrumb'
import { ThemeSwitch } from './theme-switcher'
import { ProfileDropdown } from './profile-dropdown'
import { Button } from '../ui/button'
import { Box, ChevronLeft, ChevronRight, Home, User } from 'lucide-react'
import { useRouter, useRouterState } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useNavigationStore } from '@renderer/stores/navigation-store'
import { NotificationsBell } from '../notifications/notifications-bell'

interface AppTopbarProps {
  children?: React.ReactNode
}

export function AppTopbar({}: AppTopbarProps) {
  const router = useRouter()
  const routerState = useRouterState()
  const { addPath, goBack, goForward, canGoBack, canGoForward } = useNavigationStore()

  const getInitialBreadcrumb = () => {
    const path = routerState.location.pathname
    
    if (path.startsWith('/home')) {
      return { icon: Home, label: 'Home' }
    }
    if (path.startsWith('/profile')) {
      return { icon: User, label: 'Profile' }
    }
    if (path.startsWith('/projects')) {
      return { icon: Box, label: 'Projects' }
    }
    return null
  }
  

  // Add current path to history when route changes
  useEffect(() => {
    addPath(routerState.location.pathname)
  }, [routerState.location.pathname, addPath])

  const handleBack = () => {
    const previousPath = goBack()
    if (previousPath) {
      router.navigate({ to: previousPath as any })
    }
  }

  const handleForward = () => {
    const nextPath = goForward()
    if (nextPath) {
      router.navigate({ to: nextPath as any })
    }
  }

  return (
    <>
      <header className="sticky top-0 z-20 bg-background shadow flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          {/* <Separator orientation="vertical" className="h-4" /> */}
          
          {/* Navigation Buttons */}
          <div className="flex items-center mr-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleBack}
              className="h-8 w-8"
              disabled={!canGoBack()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleForward}
              className="h-8 w-8"
              disabled={!canGoForward()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* <Breadcrumb>
            <BreadcrumbList>
              {(() => {
                const initial = getInitialBreadcrumb()
                if (!initial) return null
                
                return (
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#" className="flex items-center gap-2">
                      <initial.icon className="h-4 w-4" />
                      <span>{initial.label}</span>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                )
              })()}
            </BreadcrumbList>
          </Breadcrumb> */}
        </div>
        <div className='ml-auto flex items-center gap-2 pr-3'>
          <NotificationsBell />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </header>
    </>
  )
}
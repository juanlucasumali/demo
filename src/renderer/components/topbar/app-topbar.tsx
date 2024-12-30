import { SidebarTrigger } from '../ui/sidebar'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../ui/breadcrumb'
import { ThemeSwitch } from './theme-switcher'
import { ProfileDropdown } from './profile-dropdown'
import { Button } from '../ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter, useRouterState } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useNavigationStore } from '@renderer/stores/navigation-store'

interface AppTopbarProps {
  children?: React.ReactNode
}

export function AppTopbar({}: AppTopbarProps) {
  const router = useRouter()
  const routerState = useRouterState()
  const { addPath, goBack, goForward, canGoBack, canGoForward } = useNavigationStore()

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

          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">
                  Building Your Application
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Data Fetching</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className='ml-auto flex items-center gap-2 pr-3'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </header>
    </>
  )
}
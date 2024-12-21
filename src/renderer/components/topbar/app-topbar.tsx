import { SidebarTrigger } from '../ui/sidebar'
import { Separator } from '@radix-ui/react-separator'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../ui/breadcrumb'
import { ThemeSwitch } from './theme-switcher'
import { ProfileDropdown } from './profile-dropdown'
interface AppTopbarProps {
  children?: React.ReactNode
}

export function AppTopbar({}: AppTopbarProps) {
  return (
    <>
      <header className="sticky top-0 z-20 bg-background shadow flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
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

import { SidebarTrigger } from '../ui/sidebar'

import { ThemeSwitch } from './theme-switcher'
import { ProfileDropdown } from './profile-dropdown'
import { Breadcrumbs } from '../navigation/breadcrumbs'
import { Separator } from '../ui/separator'

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
          <Breadcrumbs />
        </div>
        <div className='ml-auto flex items-center gap-2 pr-3'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </header>
    </>
  )
}
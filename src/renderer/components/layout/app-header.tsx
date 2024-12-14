import { ThemeSwitch } from '@/renderer/components/theme-switch'
import { ProfileDropdown } from '@/renderer/components/profile-dropdown'
import { Header } from '@/renderer/components/layout/header'
import { Breadcrumbs } from '@/renderer/components/layout/app-breadcrumbs'

interface AppHeaderProps {
  children?: React.ReactNode
}

export function AppHeader({ children }: AppHeaderProps) {
  return (
    <Header>
      <div className="flex items-center flex-1 gap-4">
        <Breadcrumbs /> 
        {children}
      </div>
      <div className='ml-auto flex items-center gap-4'>
        <ThemeSwitch />
        <ProfileDropdown />
      </div>
    </Header>
  )
}

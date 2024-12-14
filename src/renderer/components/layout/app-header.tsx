import { Search } from '@/renderer/components/search'
import { ThemeSwitch } from '@/renderer/components/theme-switch'
import { ProfileDropdown } from '@/renderer/components/profile-dropdown'
import { Header } from '@/renderer/components/layout/header'

interface AppHeaderProps {
  showSearch?: boolean // Optional prop to control Search visibility
  children?: React.ReactNode // Optional additional content
}

export function AppHeader({ showSearch = true, children }: AppHeaderProps) {
  return (
    <Header>
      <div className="flex items-center flex-1 gap-4">
        {showSearch && <Search />}
        {children}
      </div>
      <div className='ml-auto flex items-center gap-4'>
        <ThemeSwitch />
        <ProfileDropdown />
      </div>
    </Header>
  )
}

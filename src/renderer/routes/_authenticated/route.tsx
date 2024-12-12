import Cookies from 'js-cookie'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { cn } from '@/renderer/lib/utils'
import { SearchProvider } from '@/renderer/context/search-context'
import { SidebarProvider } from '@/renderer/components/ui/sidebar'
import { AppSidebar } from '@/renderer/components/layout/app-sidebar'
import SkipToMain from '@/renderer/components/skip-to-main'
import { protectedLoader } from '@/renderer/lib/auth'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: protectedLoader,
  component: RouteComponent,
})

function RouteComponent() {
  const defaultOpen = Cookies.get('sidebar:state') !== 'false'
  return (
    <SearchProvider>
      <SidebarProvider defaultOpen={defaultOpen}>
        <SkipToMain />
        <AppSidebar />
        <div
          id='content'
          className={cn(
            'max-w-full w-full ml-auto',
            'peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon))]',
            'peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]',
            'transition-[width] ease-linear duration-200',
            'h-svh flex flex-col'
          )}
        >
          <Outlet />
        </div>
      </SidebarProvider>
    </SearchProvider>
  )
}

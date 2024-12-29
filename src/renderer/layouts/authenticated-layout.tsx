import { Outlet } from '@tanstack/react-router'
import { AuthGuard } from '@renderer/guards/auth-guard'
import { AppSidebar } from '@renderer/components/sidebar/app-sidebar'
import { AppTopbar } from '@renderer/components/topbar/app-topbar'
import { SidebarProvider } from '@renderer/components/ui/sidebar'
import { cn } from '@renderer/lib/utils'

interface AuthenticatedLayoutProps {
  children: React.ReactNode
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  return (
    <AuthGuard>
      <SidebarProvider>
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
          <AppTopbar />
          {children}
        </div>
      </SidebarProvider>
    </AuthGuard>
  )
} 
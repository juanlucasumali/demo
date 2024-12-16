import { useNavigate } from '@tanstack/react-router'
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
  User as UserIcon,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/renderer/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/renderer/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/renderer/components/ui/sidebar'
import { useAuth } from '@/renderer/stores/useAuthStore'
import { toast } from '@/renderer/hooks/use-toast'
import { Skeleton } from '@/renderer/components/ui/skeleton'
import { useState } from 'react'

export function NavUser() {
  const { isMobile } = useSidebar()
  const navigate = useNavigate()
  const { signOut, userProfile } = useAuth()
  const [imageError, setImageError] = useState(false)

  const handleLogout = async () => {
    try {
      await signOut()
      toast({
        title: 'Success',
        description: 'Successfully logged out',
      })
      navigate({ to: '/sign-in' })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to log out',
      })
    }
  }

  if (!userProfile) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="flex items-center space-x-4 p-4">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-3 w-[80px]" />
            </div>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  const initials = userProfile.displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <Avatar className='h-8 w-8 rounded-lg'>
                {userProfile.avatar && !imageError ? (
                  <AvatarImage 
                    src={userProfile.avatar} 
                    alt={userProfile.displayName}
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <AvatarFallback className='rounded-lg'>
                    {initials || <UserIcon className="h-4 w-4" />}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-semibold'>
                  {userProfile.displayName || `@${userProfile.username}`}
                </span>
                <span className='truncate text-xs text-muted-foreground'>
                  @{userProfile.username}
                </span>
              </div>
              <ChevronsUpDown className='ml-auto size-4' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
            side={isMobile ? 'bottom' : 'right'}
            align='end'
            sideOffset={4}
          >
            <DropdownMenuLabel className='p-0 font-normal'>
              <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                <Avatar className='h-8 w-8 rounded-lg'>
                  {userProfile.avatar && !imageError ? (
                    <AvatarImage 
                      src={userProfile.avatar} 
                      alt={userProfile.displayName}
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <AvatarFallback className='rounded-lg'>
                      {initials || <UserIcon className="h-4 w-4" />}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-semibold'>
                    {userProfile.displayName || `@${userProfile.username}`}
                  </span>
                  <span className='truncate text-xs text-muted-foreground'>
                    @{userProfile.username}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles className="mr-2 h-4 w-4" />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck className="mr-2 h-4 w-4" />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard className="mr-2 h-4 w-4" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

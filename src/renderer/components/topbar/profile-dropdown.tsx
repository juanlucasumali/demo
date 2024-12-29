import { useState } from 'react'
import { User as UserIcon } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { Avatar, AvatarFallback } from '../ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Button } from '../ui/button'
import { useToast } from '../../hooks/use-toast'
import { Skeleton } from '../../components/ui/skeleton'
import { useAuth } from '@renderer/context/auth-context'
import { useUserStore } from '@renderer/stores/user-store'

export function ProfileDropdown() {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const { toast } = useToast()
  const user = useUserStore((state) => state.user)

  const handleLogout = async () => {
    try {
      await signOut()
      toast({
        title: 'Success',
        description: 'Successfully logged out',
      })
      navigate({ to: '/signin' })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to log out',
      })
    }
  }

  if (!user) {
    return (
      <div className="flex items-center space-x-4">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    )
  }

  const initials = user.email
    ?.split('@')[0]
    ?.slice(0, 2)
    ?.toUpperCase() || 'U'

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
          <Avatar className='h-8 w-8'>
            <AvatarFallback>
              {initials || <UserIcon className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56' align='end' forceMount>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => navigate({ to: '/profile' })}>
            Profile
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Billing
            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Settings
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>New Team</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          Log out
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

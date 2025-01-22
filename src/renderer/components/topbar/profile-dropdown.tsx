import { User as UserIcon } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
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
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Link } from '@tanstack/react-router'

export function ProfileDropdown() {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const { toast } = useToast()
  const profile = useUserStore((state) => state.profile)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    try {
      setIsLoading(true)
      await signOut()
      
      // Set a timeout for navigation and toast
      setTimeout(() => {
        navigate({ to: '/auth' })
        toast({
          title: 'Success',
          description: 'Successfully logged out',
        })
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to log out',
      })
      setIsLoading(false)
    }
  }

  if (!profile) {
    return (
      <div className="flex items-center space-x-4">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    )
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild disabled={isLoading}>
        <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
          <Avatar className='h-8 w-8'>
            <AvatarImage src={profile.avatar || undefined} />
            <AvatarFallback>
              {profile.username.slice(0, 1).toUpperCase() || <UserIcon className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56' align='end' forceMount>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link to={`/profiles/${profile.id}` as any}>
            <DropdownMenuItem 
              disabled={isLoading}
            >
            Profile
            {/* <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut> */}
          </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={e => {
            e.preventDefault()
            e.stopPropagation()
            handleLogout()
          }}
          disabled={isLoading}
          className="gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Logging out...
            </>
          ) : (
            <>
              Log out
              {/* <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut> */}
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

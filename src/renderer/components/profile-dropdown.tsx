import { useState } from 'react'
import { User as UserIcon } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'
import { Button } from '../components/ui/button'
import { toast } from '../hooks/use-toast'
import { Skeleton } from '../components/ui/skeleton'

export function ProfileDropdown() {
  const navigate = useNavigate()
//   const { signOut, userProfile } = useAuth()
  const [imageError, setImageError] = useState(false)

//   const handleLogout = async () => {
//     try {
//       await signOut()
//       toast({
//         title: 'Success',
//         description: 'Successfully logged out',
//       })
//       navigate({ to: '/sign-in' })
//     } catch (error) {
//       toast({
//         variant: 'destructive',
//         title: 'Error',
//         description: error instanceof Error ? error.message : 'Failed to log out',
//       })
//     }
//   }

//   if (!userProfile) {
//     return (
//       <div className="flex items-center space-x-4">
//         <Skeleton className="h-8 w-8 rounded-full" />
//       </div>
//     )
//   }

//   const initials = 'userProfile'.displayName
//     .split(' ')
//     .map(n => n[0])
//     .join('')
//     .toUpperCase()
//     .slice(0, 2)

  const initials = 'Lucas'
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
          <Avatar className='h-8 w-8'>
            {/* {userProfile.avatar && !imageError ? (
              <AvatarImage 
                src={userProfile.avatar} 
                alt={userProfile.displayName}
                onError={() => setImageError(true)}
              /> */}
            {/* ) : ( */}
              <AvatarFallback>
                {initials || <UserIcon className="h-4 w-4" />}
              </AvatarFallback>
            {/* )} */}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56' align='end' forceMount>
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col space-y-1'>
            <p className='text-sm font-medium leading-none'>
              {/* {userProfile.displayName || `@${userProfile.username}`} */}
            </p>
            <p className='text-xs leading-none text-muted-foreground'>
              {/* @{userProfile.username} */}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
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
        <DropdownMenuItem 
        // onClick={handleLogout}
        >
          Log out
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

import { PageContent } from '@renderer/components/page-layout/page-content'
import { PageMain } from '@renderer/components/page-layout/page-main'
import { createFileRoute, useParams } from '@tanstack/react-router'
import { ProfileHeader } from '@renderer/components/profile/profile-header'
import { Highlights } from '@renderer/components/profile/highlights'
import { Favorites } from '@renderer/components/profile/favorites'
import { SocialIcon } from 'react-social-icons'
import { FavoriteSongs } from '@renderer/components/profile/favorites-songs'
import { useUserStore } from '@renderer/stores/user-store'
import { useUsers } from '@renderer/hooks/use-users'
import { UserProfile } from '@renderer/types/users'
import { Skeleton } from '@renderer/components/ui/skeleton'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@renderer/components/ui/alert'

export const Route = createFileRoute('/profiles/$userId/')({
  component: Profile,
})

export default function Profile() {
  const { userId } = useParams({ from: '/profiles/$userId/' })
  const { profile, isLoading: { profile: isLoadingProfile } } = useUsers({ userId })

  if (isLoadingProfile) {
    return (
      <PageMain>
        <div className="flex items-center gap-6 container mx-auto py-10 px-10">
          <Skeleton className="h-48 w-48 rounded-full" />
          <div className="space-y-4 flex-1">
            <Skeleton className="h-12 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
          </div>
        </div>
      </PageMain>
    )
  }

  if (!profile) {
    return (
      <PageMain>
        <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
          <Alert variant="destructive" className="max-w-lg">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Profile not found</AlertTitle>
            <AlertDescription>
              The profile you're looking for doesn't exist or you don't have permission to view it.
            </AlertDescription>
          </Alert>
        </div>
      </PageMain>
    )
  }

  return (
    <PageMain>
      <ProfileHeader
        profile={profile}
      />

      <PageContent>

        {/* Page Header Skeleton */}
        <div className="grid gap-4">
          <div className='grid lg:grid-cols-2 gap-4'>
            <Highlights
              profile={profile}
            />
            <div className="grid gap-4 grid-cols-2">
                <Favorites
                  profile={profile}
                />
                {/* <FavoriteSongs/> */}
            </div>
            </div>
            {/* <div className="flex flex-row-reverse gap-2 px-4 pt-6">
              <SocialIcon url="www.instagram.com" fgColor='hsl(var(--primary))' bgColor='transparent' className='bg-background'/>
              <SocialIcon url="www.spotify.com" fgColor='hsl(var(--primary))' bgColor='transparent' className='bg-background'/>
              <SocialIcon url="www.youtube.com" fgColor='hsl(var(--primary))' bgColor='transparent' className='bg-background'/>
              <SocialIcon url="www.reddit.com" fgColor='hsl(var(--primary))' bgColor='transparent' className='bg-background'/>
            </div> */}
        </div>

        {/* Socials */}

      </PageContent>
    </PageMain>
  )
}

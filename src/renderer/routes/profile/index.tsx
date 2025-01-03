import { PageContent } from '@renderer/components/page-layout/page-content'
import { PageMain } from '@renderer/components/page-layout/page-main'
import { createFileRoute } from '@tanstack/react-router'
import { ProfileHeader } from '@renderer/components/profile/profile-header'
import { Highlights } from '@renderer/components/profile/highlights'
import { Favorites } from '@renderer/components/profile/favorites'
import { SocialIcon } from 'react-social-icons'
import { FavoriteSongs } from '@renderer/components/profile/favorites-songs'
import { useUserStore } from '@renderer/stores/user-store'


export const Route = createFileRoute('/profile/')({
  component: Profile,
})

export default function Profile() {
  const profile = useUserStore((state) => state.profile)

  if (!profile) {
    return <div>Loading...</div>
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
            <Highlights/>
            <div className="grid gap-4 grid-cols-2">
                <Favorites/>
                <FavoriteSongs/>
            </div>
            </div>
            <div className="flex flex-row-reverse gap-2 px-4 pt-6">
              <SocialIcon url="www.instagram.com" fgColor='hsl(var(--primary))' bgColor='transparent' className='bg-background'/>
              <SocialIcon url="www.spotify.com" fgColor='hsl(var(--primary))' bgColor='transparent' className='bg-background'/>
              <SocialIcon url="www.youtube.com" fgColor='hsl(var(--primary))' bgColor='transparent' className='bg-background'/>
              <SocialIcon url="www.reddit.com" fgColor='hsl(var(--primary))' bgColor='transparent' className='bg-background'/>
          </div>
        </div>

        {/* Socials */}

      </PageContent>
    </PageMain>
  )
}

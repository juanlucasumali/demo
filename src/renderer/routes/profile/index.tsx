import { PageHeader } from '@renderer/components/page/page-header'
import { FileQuestion, User, Youtube } from 'lucide-react'
import { PageContent } from '@renderer/components/page/page-content'
import { PageMain } from '@renderer/components/page/page-main'
import { createFileRoute } from '@tanstack/react-router'
import { ProfileHeader } from '@renderer/components/profile/profile-header'
import { user } from '@renderer/components/sidebar/nav-user'
import { Highlights } from '@renderer/components/profile/highlights'
import { Favorites } from '@renderer/components/profile/favorites'
import { SocialIcon } from 'react-social-icons'
import { FavoriteSongs } from '@renderer/components/profile/favorites-songs'


export const Route = createFileRoute('/profile/')({
  component: Profile,
})

export default function Profile() {
  return (
    <PageMain>
      <ProfileHeader
        user={user}
      />

      <PageContent>

        {/* Page Header Skeleton */}
        <div className="grid gap-4 lg:grid-cols-2">
            <Highlights/>
            <div className="grid gap-4 grid-cols-2">
                <Favorites/>
                <FavoriteSongs/>
            </div>
        </div>

        {/* Socials */}

        <div className="absolute bottom-4 right-4 flex gap-2 px-4 pt-6">
            <SocialIcon url="www.instagram.com" fgColor='hsl(var(--primary))' bgColor='transparent' className='bg-background'/>
            <SocialIcon url="www.spotify.com" fgColor='hsl(var(--primary))' bgColor='transparent' className='bg-background'/>
            <SocialIcon url="www.youtube.com" fgColor='hsl(var(--primary))' bgColor='transparent' className='bg-background'/>
            <SocialIcon url="www.reddit.com" fgColor='hsl(var(--primary))' bgColor='transparent' className='bg-background'/>
        </div>

      </PageContent>
    </PageMain>
  )
}

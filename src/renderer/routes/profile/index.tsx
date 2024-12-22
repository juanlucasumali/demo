import { PageHeader } from '@renderer/components/page/page-header'
import { FileQuestion, User } from 'lucide-react'
import { PageContent } from '@renderer/components/page/page-content'
import { PageMain } from '@renderer/components/page/page-main'
import { createFileRoute } from '@tanstack/react-router'
import { ProfileHeader } from '@renderer/components/profile/profile-header'
import { user } from '@renderer/components/sidebar/nav-user'

export const Route = createFileRoute('/profile/')({
  component: Profile,
})

export default function Profile() {
  return (
    <PageMain>
      <ProfileHeader
        user={user}
      />

      {/* <PageContent>
        <DataTable columns={columns} data={data} />
      </PageContent> */}
    </PageMain>
  )
}

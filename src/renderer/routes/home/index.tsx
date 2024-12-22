import { columns } from '../../components/home/data-table/columns'
import { DataTable } from '../../components/home/data-table'
import { createFileRoute } from '@tanstack/react-router'
import { PageHeader } from '@renderer/components/page/page-header'
import { HomeIcon } from 'lucide-react'
import { PageContent } from '@renderer/components/page/page-content'
import { PageMain } from '@renderer/components/page/page-main'
import { dummyData } from '../../components/home/dummy-data'

export const Route = createFileRoute('/home/')({
  component: Home,
})

export default function Home() {
  return (
    <PageMain>
      <PageHeader
        title={'Home'}
        description={'Supercharge creativity, simplify your media.'}
        icon={HomeIcon}
      />

      <PageContent>
        <DataTable columns={columns} data={dummyData} />
      </PageContent>
    </PageMain>
  )
}

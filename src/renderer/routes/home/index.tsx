import { columns } from "./data-table/columns"
import { DataTable } from "./data-table/data-table"
import { createFileRoute } from '@tanstack/react-router'
import { payments } from './data-table/payments'

export const Route = createFileRoute('/home/')({
  component: Home,
})

export default function Home() {
  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* Page Header Skeleton */}
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-muted/50" />
        </div>

        {/* Page Content Skeleton */}
        {/* <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min"/> */}

        {/* Page Content */}
        <div className="min-h-[50vh] flex-1 rounded-xl md:min-h-min">
          <div className="container mx-auto py-5 px-10">
            <DataTable columns={columns} data={payments} />
          </div>
        </div>
      </div>
    </>
  )
}
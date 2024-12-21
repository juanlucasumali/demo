import { columns } from "./data-table/columns"
import { DataTable } from "./data-table/data-table"
import { createFileRoute } from '@tanstack/react-router'
import { PageHeader } from "@renderer/components/page/page-header"
import { HomeIcon } from "lucide-react"
import { PageContent } from "@renderer/components/page/page-content"
import { PageMain } from "@renderer/components/page/page-main"
import { dummyData } from "./data-table/dummy-data"

export const Route = createFileRoute('/home/')({
  component: Home,
})

export default function Home() {
  return (
    <>
      <PageMain>        
        
        {/* Page Header Skeleton */}
        {/* <div className="flex items-center gap-4 container mx-auto pt-10 px-10">
          <div className='flex size-12 items-center justify-center top-0 rounded-xl bg-muted/50'>
          </div>
          <div className="flex flex-col gap-0.5">
            <h1 className="text-2xl font-bold tracking-tight"></h1>
            <p className='text-sm text-muted-foreground'></p>
          </div>
        </div> */}

        <PageHeader
          title={"Home"}
          description={"Supercharge creativity, simplify your media."}
          icon={HomeIcon}
        />

        {/* Page Content Skeleton */}
        {/* <div className="min-h-[50vh] flex-1 rounded-xl md:min-h-min container mx-auto py-5 px-10 bg-muted/50"> */}

        <PageContent>
            <DataTable columns={columns} data={dummyData} />
        </PageContent>
      </PageMain>
    </>
  )
}
import { AppTopbar } from '@renderer/components/app-topbar'
import { AppSidebar } from '../components/sidebar/app-sidebar'
import {
  SidebarInset,
  SidebarProvider,
} from '../components/ui/sidebar'

// export const Route = createFileRoute('/default-page')({
//   component: DefaultPage,
// })

export default function DefaultPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppTopbar />

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
          <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
            <div className="container mx-auto py-5 px-10">
            </div>
          </div>
          
        </div>

      </SidebarInset>
    </SidebarProvider>
  )
}
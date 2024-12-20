import { AppTopbar } from '@renderer/components/app-topbar'
import { AppSidebar } from '../../components/sidebar/app-sidebar'
import {
  SidebarInset,
  SidebarProvider,
} from '../../components/ui/sidebar'

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/home/')({
  component: Home,
})

export default function Home() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppTopbar />

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
          </div>
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

import { FC } from 'react'
import { Outlet } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "../../components/ui/breadcrumb"
import { Separator } from "../../components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "../../components/ui/sidebar"
import { Sidebar } from '@renderer/pages/dashboard/Sidebar'

export const DashboardLayout: FC = () => {

  return (
    <div className="relative flex h-full w-full overflow-hidden">
      <SidebarProvider>
      <Sidebar />
      <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    {/* <BreadcrumbLink href="#">{currentPage.title}</BreadcrumbLink> */}
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Folder 1</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 h-full">
              <Outlet />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}

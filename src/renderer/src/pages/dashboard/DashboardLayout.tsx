import { FC } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "../../components/ui/breadcrumb"
import { Separator } from "../../components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "../../components/ui/sidebar"
import { sidebarData } from '@renderer/data/sidebar'
import { Sidebar } from '@renderer/components/dashboard/sidebar/Sidebar'

export const DashboardLayout: FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  
  const currentPath = location.pathname.split('/').pop() || 'files'

  const handleNavigate = (path: string) => {
    navigate(`/dashboard/${path}`)
  }

  return (
    <div className="relative flex h-full w-full overflow-hidden">
      <SidebarProvider>
      <Sidebar onNavigate={handleNavigate} />
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

import { FC, useState } from 'react'
import { AppSidebar } from "./sidebar/AppSidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "../ui/breadcrumb"
import { Separator } from "../ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "../ui/sidebar"
import { NavItem } from '@renderer/types/sidebar'
import { sidebarData } from '@renderer/data/sidebar'
import { Connect } from './Connect/Connect'
import MyFiles from './MyFiles/MyFiles'

interface DashboardProps {
}

export const Dashboard: FC<DashboardProps> = ({ }) => {
  const defaultPage = sidebarData.navMain.find(item => item.viewType === "files") || sidebarData.navMain[0];
const [currentPage, setCurrentPage] = useState<NavItem>(defaultPage);

  const renderView = () => {
    switch (currentPage.viewType) {
      case "files":
        return <MyFiles />;
      case "models":
        return <div>Models View</div>;
      case "documentation":
        return <div>Documentation View</div>;
      case "connect":
        return <Connect />;  
      case "settings":
        return <div>Settings View</div>;
      default:
        return <MyFiles />;
    }
  }

  return (
    <div className="relative flex h-full w-full overflow-hidden">
      <SidebarProvider>
        <AppSidebar setCurrentPage={setCurrentPage} />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#">{currentPage.title}</BreadcrumbLink>
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
              {renderView()}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
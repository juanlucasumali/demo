
import { ChevronRight, Home, MoreHorizontal } from 'lucide-react'
import { useNavigationStore } from '@/renderer/stores/useNavigationStore'
import { Button } from '@/renderer/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/renderer/components/ui/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/renderer/components/ui/dropdown-menu"
import React from 'react'
import { useProjectsStore } from '@/renderer/stores/useProjectsStore'
import { useProjectItemsStore } from '@/renderer/stores/useProjectItemsStore'

export function Breadcrumbs() {
  const { getCurrentPath, navigate } = useNavigationStore()
  const { breadcrumbs } = useProjectItemsStore()
  const { projects } = useProjectsStore()
  const currentPath = getCurrentPath()

  // Parse the current path
  const pathSegments = currentPath.split('/').filter(Boolean)

  // Combine static path segments with folder breadcrumbs
  const getAllBreadcrumbs = () => {
    const allBreadcrumbs: Array<{ id: string; name: string; path: string }> = []

    // Always add Home
    allBreadcrumbs.push({
      id: 'home',
      name: 'Home',
      path: '/projects'
    })

    // Add static path segments
    pathSegments.forEach((segment, index) => {
      if (segment === 'projects') {
        allBreadcrumbs.push({
          id: 'projects',
          name: 'Projects',
          path: '/projects'
        })
      } else if (index === 1 && pathSegments[0] === 'projects') {
        // This is a project ID
        const project = projects.find(p => p.id === segment)
        if (project) {
          allBreadcrumbs.push({
            id: project.id,
            name: project.name,
            path: `/projects/${project.id}`
          })
        }
      }
    })

    // Add folder breadcrumbs
    if (breadcrumbs.length > 0) {
      breadcrumbs.forEach(crumb => {
        allBreadcrumbs.push({
          ...crumb,
          path: `/projects/${pathSegments[1]}/${crumb.id}`
        })
      })
    }

    return allBreadcrumbs
  }

  const allBreadcrumbs = getAllBreadcrumbs()

  // Always show first (Home) and last two items
  const visibleBreadcrumbs = allBreadcrumbs.length <= 3
    ? allBreadcrumbs
    : [
        allBreadcrumbs[0], // Home
        allBreadcrumbs[allBreadcrumbs.length - 2], // Parent
        allBreadcrumbs[allBreadcrumbs.length - 1], // Current
      ]

  const hiddenBreadcrumbs = allBreadcrumbs.length > 3
    ? allBreadcrumbs.slice(1, -2)
    : []

  if (pathSegments.length === 0) return null

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {visibleBreadcrumbs.map((crumb, index) => {
          const isLast = index === visibleBreadcrumbs.length - 1
          const showEllipsis = hiddenBreadcrumbs.length > 0 && index === 0

          return (
            <React.Fragment key={crumb.id}>
              {index > 0 && (
                <BreadcrumbSeparator>
                  <ChevronRight className="h-4 w-4" />
                </BreadcrumbSeparator>
              )}

              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="max-w-[200px] truncate">
                    <Button
                      variant="ghost"
                      className="h-6 px-2 max-w-[200px] truncate"
                    >
                      {crumb.name}
                    </Button>
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Button
                      variant="ghost"
                      className="h-6 px-2 max-w-[200px] truncate"
                      onClick={() => navigate(crumb.path)}
                    >
                      {crumb.id === 'home' ? (
                        <Home className="h-4 w-4" />
                      ) : (
                        crumb.name
                      )}
                    </Button>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>

              {showEllipsis && hiddenBreadcrumbs.length > 0 && (
                <>
                  <BreadcrumbSeparator>
                    <ChevronRight className="h-4 w-4" />
                  </BreadcrumbSeparator>
                  <BreadcrumbItem>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-6 w-6 p-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">More</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        {hiddenBreadcrumbs.map((hidden) => (
                          <DropdownMenuItem
                            key={hidden.id}
                            onClick={() => navigate(hidden.path)}
                          >
                            {hidden.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </BreadcrumbItem>
                </>
              )}
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

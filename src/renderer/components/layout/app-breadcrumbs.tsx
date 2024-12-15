
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
import { useEffect, useState } from 'react'
import React from 'react'
import { useProjectsStore } from '@/renderer/stores/useProjectsStore'
import { useProjectItemsStore } from '@/renderer/stores/useProjectItemsStore'

export function Breadcrumbs() {
  const { getCurrentPath, navigate } = useNavigationStore()
  const currentPath = getCurrentPath()
  const [hiddenSegments, setHiddenSegments] = useState<string[]>([])
  const [visibleSegments, setVisibleSegments] = useState<string[]>([])
  const { projects } = useProjectsStore()
  const { items } = useProjectItemsStore();

  // Split the path and remove empty strings
  const pathSegments = currentPath.split('/').filter(Boolean)

  // Function to generate the breadcrumb label
  const getBreadcrumbLabel = (segment: string) => {
    // Check if we're in the projects path
    if (pathSegments[0] === 'projects' && segment === pathSegments[1]) {
      // Look up project name
      const project = projects.find(p => p.id === segment)
      console.log("Breadcrumb label: ", project?.name || '')
      return project?.name || '' //TODO: LOADING
    }
    
    // Check if this is a folder ID
    if (pathSegments[0] === 'projects' && segment === pathSegments[2]) {
      // You'll need to implement folder lookup logic here
      const folder = items.find(p => p.id === segment)
      console.log("Breadcrumb label: ", folder?.name || '')
      return folder?.name || '' //TODO: LOADING
    }
  
    // Default formatting for other segments
    console.log("Breadcrumb label: ", segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '))
    return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
  }

  // Function to generate the path up to a specific segment
  const getPathToSegment = (index: number, segments = pathSegments) => {
    return '/' + segments.slice(0, index + 1).join('/')
  }

  // Calculate visible and hidden segments based on screen width
  useEffect(() => {
    const calculateVisibleSegments = () => {
      if (pathSegments.length <= 3) {
        setVisibleSegments(pathSegments)
        setHiddenSegments([])
        return
      }

      // Show first, last two segments, and ellipsis
      setVisibleSegments([pathSegments[0], pathSegments[pathSegments.length - 2], pathSegments[pathSegments.length - 1]])
      setHiddenSegments(pathSegments.slice(1, -2))
    }

    calculateVisibleSegments()
    window.addEventListener('resize', calculateVisibleSegments)
    return () => window.removeEventListener('resize', calculateVisibleSegments)
  }, [currentPath])

  if (pathSegments.length === 0) return null

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Button
              variant="ghost"
              className="h-6 p-2"
              onClick={() => navigate('/')}
            >
              <Home className="h-4 w-4" />
            </Button>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {visibleSegments.map((segment, index) => {
          const isLast = index === visibleSegments.length - 1
          const showEllipsis = hiddenSegments.length > 0 && index === 0

          return (
            <React.Fragment key={index}>
              <BreadcrumbItem>
                <BreadcrumbSeparator>
                  <ChevronRight className="h-4 w-4" />
                </BreadcrumbSeparator>
                
                {isLast ? (
                  <BreadcrumbPage className="max-w-[200px] truncate">
                    <Button
                      variant="ghost"
                      className="h-6 px-2 max-w-[200px] truncate"
                    >
                      {getBreadcrumbLabel(segment)}
                    </Button>
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Button
                      variant="ghost"
                      className="h-6 px-2 max-w-[200px] truncate"
                      onClick={() => navigate(getPathToSegment(index, visibleSegments))}
                    >
                      {getBreadcrumbLabel(segment)}
                    </Button>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>

              {showEllipsis && hiddenSegments.length > 0 && (
                <BreadcrumbItem>
                  <BreadcrumbSeparator>
                    <ChevronRight className="h-4 w-4" />
                  </BreadcrumbSeparator>
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
                      {hiddenSegments.map((segment, hiddenIndex) => (
                        <DropdownMenuItem
                          key={hiddenIndex}
                          onClick={() => navigate(getPathToSegment(hiddenIndex + 1))}
                        >
                          {getBreadcrumbLabel(segment)}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </BreadcrumbItem>
              )}
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

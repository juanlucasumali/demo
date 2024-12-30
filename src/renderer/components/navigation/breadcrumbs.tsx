import { isMatch, Link, useMatches } from '@tanstack/react-router'
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator,
  BreadcrumbEllipsis
} from '../ui/breadcrumb'
import { Home } from 'lucide-react'
import { useState } from 'react'
import { useNavigationHistory } from '../../hooks/use-navigation-history'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'

export function Breadcrumbs() {
  const matches = useMatches()
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  if (matches.some((match) => match.status === 'pending')) return null

  const folderMatch = matches.find(match => 
    match.pathname.startsWith('/home/folders/') && 
    isMatch(match, 'loaderData.breadcrumb')
  )

  const path = useNavigationHistory(
    folderMatch?.loaderData?.breadcrumb.id,
    folderMatch?.loaderData?.breadcrumb.label
  )

  const shouldShowEllipsis = path.length > 2
  const visibleCrumbs = shouldShowEllipsis 
    ? path.slice(-2)
    : path
  const hiddenCrumbs = shouldShowEllipsis 
    ? path.slice(0, -2)
    : []

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/home" className="flex items-center gap-2">
              <Home size={16} />
              <span>Home</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />

        {shouldShowEllipsis && (
          <>
            <BreadcrumbItem>
              <DropdownMenu open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <DropdownMenuTrigger className="flex items-center gap-1">
                  <BreadcrumbEllipsis className="h-4 w-4 cursor-pointer hover:text-foreground" />
                  <span className="sr-only">Toggle menu</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-fit">
                  {hiddenCrumbs.map((folder) => (
                    <DropdownMenuItem key={folder.id}>
                      <Link 
                        to="/home/folders/$folderId" 
                        params={{ folderId: folder.id }}
                        className="w-full"
                        onClick={() => setIsPopoverOpen(false)}
                      >
                        {folder.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <BreadcrumbSeparator />
            </BreadcrumbItem>
          </>
        )}

        {visibleCrumbs.map((folder, i) => (
          <BreadcrumbItem key={folder.id}>
            {i === visibleCrumbs.length - 1 ? (
              <BreadcrumbPage>{folder.name}</BreadcrumbPage>
            ) : (
              <>
                <BreadcrumbLink asChild>
                  <Link to="/home/folders/$folderId" params={{ folderId: folder.id }}>
                    {folder.name}
                  </Link>
                </BreadcrumbLink>
                <BreadcrumbSeparator />
              </>
            )}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
} 
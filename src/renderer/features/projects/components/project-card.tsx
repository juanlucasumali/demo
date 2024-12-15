import { IconStar, IconStarFilled, IconDots, IconShare, IconEdit } from '@tabler/icons-react'
import { Badge } from "@/renderer/components/ui/badge"
import { Separator } from "@/renderer/components/ui/separator"
import { formatDate, generateGradientStyle } from '@/renderer/lib/utils'
import { Project } from '@/renderer/components/layout/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/renderer/components/ui/dropdown-menu"
import { useMemo } from 'react'
import { navigation } from '@/renderer/stores/useNavigationStore'

interface ProjectCardProps {
  project: Project
  toggleStar: (projectName: string) => void
  displayPreferences: {
    tags: boolean
    dateCreated: boolean
    lastModified: boolean
  }
}

export const ProjectCard = ({
  project,
  toggleStar,
  displayPreferences,
}: ProjectCardProps) => {
  const logoGradientStyle = useMemo(() => {
    // if (project.logo) return {};
    return generateGradientStyle(project.id);
  }, [project.id, project.logo]);

  const handleClick = () => {
    navigation.navigate(`/projects/${project.id}`)
  }

  return (
    <li 
    className='rounded-lg border p-4 hover:shadow-md cursor-pointer'
    onClick={handleClick}
      >
      <div className='mb-8 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <div 
            className={`flex size-10 items-center justify-center rounded-lg p-2`}
            style={logoGradientStyle}
          >
            {/* {getIconComponent(project.logo)} */}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="hover:bg-muted p-2 rounded-md"
              >
                <IconDots size={20} className="text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  // Handle share action
                  console.log('Share', project.name)
                }}
              >
                <IconShare className="mr-2 h-4 w-4" />
                <span>Share</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={( e) => {
                  e.stopPropagation()
                  // Handle edit action
                  console.log('Edit', project.name)
                }}
              >
                <IconEdit className="mr-2 h-4 w-4" />
                <span>Edit details</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            onClick={(e) => {
              e.stopPropagation()
              toggleStar(project.name)
            }}
            className='text-gray-400 hover:text-yellow-400 dark:hover:text-yellow-300'
          >
            {project.isStarred 
              ? <IconStarFilled size={20} className="text-yellow-400" /> 
              : <IconStar size={20} />}
          </button>
        </div>
      </div>
      {/* Rest of the component remains the same */}
      <div>
        <h2 className='mb-1 font-semibold'>{project.name}</h2>
        <p className='line-clamp-2 text-gray-500 text-sm mb-4'>{project.description}</p>
        
        {displayPreferences.tags && (
          <div className="overflow-x-auto no-scrollbar mb-4">
            <div className="flex gap-2 min-w-min">
              {project.tags.map((tag) => (
                <Badge
                  key={tag.name}
                  variant="secondary"
                  className={`whitespace-nowrap px-2 py-0.5
                    ${tag.color === 'blue' && 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'}
                    ${tag.color === 'green' && 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'}
                    ${tag.color === 'red' && 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}
                    ${tag.color === 'yellow' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'}
                    ${tag.color === 'purple' && 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'}
                    ${tag.color === 'pink' && 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300'}
                    ${tag.color === 'sky' && 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300'}
                    ${tag.color === 'orange' && 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'}
                  `}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {(displayPreferences.dateCreated || displayPreferences.lastModified) && (
          <Separator className="my-3" />
        )}

        <div className="text-sm text-muted-foreground space-y-1">
          {displayPreferences.dateCreated && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Created:</span>
              <span className="text-xs">{formatDate(project.dateCreated)}</span>
            </div>
          )}
          {displayPreferences.lastModified && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Modified:</span>
              <span className="text-xs">{formatDate(project.lastModified)}</span>
            </div>
          )}
        </div>
      </div>
    </li>
  )
}

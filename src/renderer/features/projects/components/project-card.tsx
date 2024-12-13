import { IconStar, IconStarFilled } from '@tabler/icons-react'
import { Badge } from "@/renderer/components/ui/badge"
import { Separator } from "@/renderer/components/ui/separator"
import { formatDate } from '@/renderer/lib/utils'

interface ProjectCardProps {
  project: {
    name: string
    desc: string
    logo: React.ReactNode
    tags: Array<{ name: string; color: string }>
    dateCreated: string
    dateModified: string
  }
  starredProjects: Set<string>
  toggleStar: (projectName: string) => void
  displayPreferences: {
    tags: boolean
    dateCreated: boolean
    dateModified: boolean
  }
}

export const ProjectCard = ({
  project,
  starredProjects,
  toggleStar,
  displayPreferences,
}: ProjectCardProps) => {
  return (
    <li className='rounded-lg border p-4 hover:shadow-md cursor-pointer'>
      <div className='mb-8 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <div className={`flex size-10 items-center justify-center rounded-lg bg-muted p-2`}>
            {project.logo}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggleStar(project.name)
          }}
          className='ml-2 text-gray-400 hover:text-yellow-400 dark:hover:text-yellow-300'
        >
          {starredProjects.has(project.name) 
            ? <IconStarFilled size={20} className="text-yellow-400" /> 
            : <IconStar size={20} />}
        </button>
      </div>
      <div>
        <h2 className='mb-1 font-semibold'>{project.name}</h2>
        <p className='line-clamp-2 text-gray-500 text-sm mb-4'>{project.desc}</p>
        
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

        {(displayPreferences.dateCreated || displayPreferences.dateModified) && (
          <Separator className="my-3" />
        )}

        <div className="text-sm text-muted-foreground space-y-1">
          {displayPreferences.dateCreated && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Created:</span>
              <span className="text-xs">{formatDate(project.dateCreated)}</span>
            </div>
          )}
          {displayPreferences.dateModified && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Modified:</span>
              <span className="text-xs">{formatDate(project.dateModified)}</span>
            </div>
          )}
        </div>
      </div>
    </li>
  )
}

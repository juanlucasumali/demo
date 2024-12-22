import { useToast } from '@renderer/hooks/use-toast'
import { formatDate, generateGradientStyle } from '@renderer/lib/utils'
import { Project } from '@renderer/types/projects'
import { useMemo, useState } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { Edit, EllipsisVertical, Share, Trash } from 'lucide-react'
import { Separator } from '../ui/separator'
// import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/renderer/components/ui/alert-dialog'

interface ProjectCardProps {
  project: Project
  toggleStar: (id: string, currentValue: boolean) => Promise<void>
  displayPreferences: {
    tags: boolean
    createdAt: boolean
    lastModified: boolean
  }
  onEditClick: (project: Project) => void
  onSharingProject: (project: Project) => void 
}

export const ProjectCard = ({
  project,
  toggleStar,
  displayPreferences,
  onEditClick,
  onSharingProject
}: ProjectCardProps) => {
  const { toast } = useToast()
  // const projects = useProjectsStore()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const iconGradientStyle = useMemo(() => {
    // if (project.icon) return {};
    return generateGradientStyle(project.id);
  }, [project.id, project.icon]);

  const handleClick = () => {
    // navigation.navigate(`/projects/${project.id}`)
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    // try {
    //   await projects.deleteProject(project.id)
    //   toast({
    //     title: "Project deleted",
    //     description: `${project.name} has been successfully deleted.`,
    //   })
    // } catch (error) {
    //   toast({
    //     title: "Error",
    //     description: "Failed to delete project. Please try again.",
    //     variant: "destructive",
    //   })
    // }
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
            style={iconGradientStyle}
          />
          
          {/* {project.collaborators && project.collaborators.length > 0 && (
            <div className="flex overflow-x-auto no-scrollbar items-center gap-1">
              {project.collaborators.map((collaborator) => (
                <TooltipProvider key={collaborator.id} delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="size-8 rounded-full border-2 border-background overflow-hidden flex-shrink-0">
                        {collaborator.avatar ? (
                          <img
                            src={collaborator.avatar}
                            alt={collaborator.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center text-xs font-medium uppercase">
                            {collaborator.username[0]}
                          </div>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" align="center">
                      <p className="text-xs">{collaborator.username}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          )} */}
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="hover:bg-muted p-2 rounded-md"
              >
                <EllipsisVertical size={20} className="text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onSharingProject(project)
                }}
              >
                <Share className="mr-2 h-4 w-4" />
                <span>Share</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onEditClick(project)
                  }}
              >
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  setShowDeleteDialog(true)
                }}
                className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
              >
                <Trash className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* <button
            onClick={(e) => {
              e.stopPropagation()
              toggleStar(project.id, project.isStarred)
            }}
            className='text-gray-400 hover:text-yellow-400 dark:hover:text-yellow-300'
          >
            {project.isStarred 
              ? <IconStarFilled size={20} className="text-yellow-400" /> 
              : <IconStar size={20} />}
          </button> */}
        </div>
      </div>
      {/* Rest of the component remains the same */}
      <div>
        <h2 className='mb-1 font-semibold'>{project.name}</h2>
        <p className='line-clamp-2 text-gray-500 text-sm mb-4'>{project.description}</p>
        
        {displayPreferences.tags && (
          <div className="overflow-x-auto no-scrollbar mb-4">
            <div className="flex gap-2 min-w-min">
              {/* {project.tags.map((tag) => (
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
              ))} */}
            </div>
          </div>
        )}

        {(displayPreferences.createdAt || displayPreferences.lastModified) && (
          <Separator className="my-3" />
        )}

        <div className="text-sm text-muted-foreground space-y-1">
          {displayPreferences.createdAt && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Created:</span>
              <span className="text-xs">{formatDate(project.createdAt)}</span>
            </div>
          )}
          {displayPreferences.lastModified && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Modified:</span>
              <span className="text-xs">{formatDate(project.lastModified)}</span>
            </div>
          )}
        </div>
        {/* <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project
              "{project.name}" and all of its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog> */}
      </div>
    </li>
  )
}

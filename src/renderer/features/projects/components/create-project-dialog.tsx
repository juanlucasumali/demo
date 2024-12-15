import { Button } from "@/renderer/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/renderer/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/renderer/components/ui/form"
import { Input } from "@/renderer/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { IconDots, IconPlus, IconStar, IconStarFilled } from "@tabler/icons-react"
import { Project, PROJECT_TAGS, ProjectTag, TagCategory } from "@/renderer/components/layout/types"
import { Badge } from "@/renderer/components/ui/badge"
import { formatDate, generateGradientStyle } from "@/renderer/lib/utils"
import { Separator } from "@/renderer/components/ui/separator"
import { useEffect, useMemo, useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/renderer/components/ui/accordion"
import { useProjectsStore } from "@/renderer/stores/useProjectsStore"
import { Circle, CircleDot, Square, SquareCheck } from "lucide-react"
import { useNavigationStore } from "@/renderer/stores/useNavigationStore"
import { useAuthStore } from "@/renderer/stores/useAuthStore"
import { useToast } from "@/renderer/hooks/use-toast"


const tagBgClasses = {
  gray: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  red: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  green: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  pink: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
  orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
} as const

const formSchema = z.object({
  name: z.string()
    .min(2, { message: "Project name must be at least 2 characters." })
    .max(30, { message: "Project name cannot exceed 30 characters." }),
  description: z.string()
    .max(60, { message: "Description cannot exceed 60 characters." }),
  tags: z.string()
    .refine(
      str => str.split(',').every(tag => tag.trim().length <= 20),
      { message: "Each tag must be 20 characters or less." }
    )
})

interface CreateProjectDialogProps {
  mode?: 'create' | 'edit'
  project?: Project
  trigger?: React.ReactNode // Optional custom trigger
  isOpen?: boolean
  onClose?: () => void
}

export function CreateProjectDialog({ mode, project, trigger, isOpen: controlledIsOpen, onClose }: CreateProjectDialogProps) {
  const [isStarred, setIsStarred] = useState(false)
  const [tags, setTags] = useState<ProjectTag[]>([])
  const [previewProjectId] = useState(crypto.randomUUID())
  const { blockNavigation, unblockNavigation } = useNavigationStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuthStore()
  const { toast } = useToast()
  const addProject = useProjectsStore((state) => state.addProject)
  const updateProject = useProjectsStore((state) => state.updateProject)
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const isOpen = controlledIsOpen ?? internalIsOpen

  useEffect(() => {
    if (project) {
      setIsStarred(project.isStarred)
      setTags(project.tags)
    }
  }, [project, mode]);

  const iconGradientStyle = useMemo(() => {
    return generateGradientStyle(project?.id ?? previewProjectId);
  }, [previewProjectId]);

  // Add reset function
  const resetForm = () => {
    form.reset()
    setTags([])
    setIsStarred(false)
  }

  // Handle dialog close
  const handleClose = () => {
    unblockNavigation()
    if (onClose) {
      onClose()
    } else {
      setInternalIsOpen(false)
    }
    resetForm()
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: project?.name ?? "",
      description: project?.description ?? "",
      tags: "",
    },
    mode: "onChange", // Add this
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to perform this action",
          variant: "destructive"
        })
        return
      }

      const projectData = {
        ownerId: user.id,
        name: values.name,
        icon: null,
        description: values.description,
        isStarred: isStarred,
        tags: tags,
        lastModified: new Date().toISOString()
      }

      if (mode === 'edit' && project) {
        await updateProject(project.id, projectData)
        toast({
          title: "Success",
          description: "Project updated successfully",
        })
      } else {
        await addProject(projectData)
        toast({
          title: "Success",
          description: "Project created successfully",
        })
      }
      
      handleClose()
    } catch (error) {
      console.error('Error handling project:', error)
      toast({
        title: "Error",
        description: `Failed to ${mode} project`,
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

    const handleOpenChange = (open: boolean) => {
    if (onClose && !open) {
      onClose()
    } else {
      setInternalIsOpen(open)
    }

    if (!open) {
      resetForm()
      unblockNavigation()
    } else {
      if (project) {
        setIsStarred(project.isStarred)
        setTags(project.tags)
      }
      blockNavigation()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="default" size="sm" className="gap-2">
            <IconPlus size={16} />
            <span>{mode === 'create' ? 'New Project' : 'Edit Project'}</span>
          </Button>
          )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New Project' : 'Edit Project'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Add a new project to your workspace. Fill in the details below.'
              : 'Update your project details below.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Preview Card */}
            <div className="rounded-lg border p-4 hover:shadow-md transition-shadow w-[450px]"> {/* or whatever width matches your design */}
              <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="flex size-10 items-center justify-center rounded-lg p-2 text-white"
                    style={iconGradientStyle}
                  >
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="hover:bg-muted p-2 rounded-md"
                    disabled
                  >
                    <IconDots size={20} className="text-muted-foreground" />
                  </button>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-yellow-400 dark:hover:text-yellow-300"
                    onClick={() => setIsStarred(!isStarred)}
                  >
                  {isStarred 
                    ? <IconStarFilled size={20} className="text-yellow-400" /> 
                    : <IconStar size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="mb-1 shadow-none">
                      <FormControl className="shadow-none">
                        <Input 
                          placeholder="Project Name" 
                          {...field}
                          maxLength={30} // Add this
                          className="border-0 p-0 h-[24px] font-semibold focus-visible:ring-0 text-base bg-transparent shadow-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="mb-4 shadow-none">
                      <FormControl className="shadow-none">
                        <div className="relative flex items-center">
                          <Input 
                            placeholder="Project description..."
                            maxLength={60}
                            className="border-0 p-0 h-[24px] focus-visible:ring-0 text-sm text-gray-500 bg-transparent shadow-none flex-1 mr-[45px]" // Added flex-1 and mr-[45px]
                            {...field}
                          />
                          <span className="absolute right-0 bottom-0 text-xs text-muted-foreground whitespace-nowrap">
                            {field.value.length}/60
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />


                <div className="space-y-4 max-w-full">
                  <Accordion type="single" collapsible className="w-full">
                    {(Object.entries(PROJECT_TAGS) as [TagCategory, typeof PROJECT_TAGS[TagCategory]][]).map(([category, config]) => (
                      <AccordionItem value={category} key={category}>
                        <AccordionTrigger className="text-sm hover:no-underline">
                          <div className="flex items-center gap-2">
                            <span className="capitalize">{category}</span>
                            <Badge 
                              variant="secondary" 
                              className={`bg-${config.color}-100 text-${config.color}-700 ${
                                tags.filter(tag => tag.category === category).length === 0 ? 'invisible' : ''
                              }`}
                            >
                              {tags.filter(tag => tag.category === category).length}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-2 gap-1 p-1">
                            {config.options.map((option) => (
                              <Button
                                key={option}
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="justify-start"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  const newTags = [...tags]
                                  const existingTagIndex = newTags.findIndex(
                                    tag => tag.name === option && tag.category === category
                                  )
                              
                                  if (existingTagIndex > -1) {
                                    newTags.splice(existingTagIndex, 1)
                                  } else {
                                    if (!config.allowMultiple) {
                                      const categoryIndex = newTags.findIndex(tag => tag.category === category)
                                      if (categoryIndex > -1) {
                                        newTags.splice(categoryIndex, 1)
                                      }
                                    }
                                    newTags.push({
                                      category,
                                      name: option,
                                      color: config.color
                                    })
                                  }
                                  setTags(newTags)
                                }}
                              >
                              <div className="flex items-center gap-2">
                                {category === 'stage' ? (
                                  // Use Circle icons for stage category
                                  tags.some(tag => tag.name === option && tag.category === category) ? (
                                    <CircleDot className="h-4 w-4" />
                                  ) : (
                                    <Circle className="h-4 w-4" />
                                  )
                                ) : (
                                  // Use Square icons for other categories
                                  tags.some(tag => tag.name === option && tag.category === category) ? (
                                    <SquareCheck className="h-4 w-4" />
                                  ) : (
                                    <Square className="h-4 w-4" />
                                  )
                                )}
                                <span className="truncate">{option}</span>
                              </div>
                              </Button>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>


                  {/* Tags display */}
                  {tags.length > 0 && (
                    <div className="w-full overflow-x-auto no-scrollbar">
                      <div className="flex gap-2 flex-nowrap" style={{ maxWidth: "400px" }}>
                        {/* Sort tags by category order */}
                        {tags
                          .sort((a, b) => {
                            const categoryOrder = ['stage', 'genre', 'needs']
                            return categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category)
                          })
                          .map((tag, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className={`whitespace-nowrap flex-shrink-0 px-2 py-0.5 ${
                                tagBgClasses[tag.color as keyof typeof tagBgClasses]
                              } group`}
                            >
                              <span>{tag.name}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()  // Add this
                                  e.preventDefault()
                                  const newTags = [...tags]
                                  newTags.splice(index, 1)
                                  setTags(newTags)
                                }}
                                className="ml-1 opacity-0 group-hover:opacity-100 flex-shrink-0"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                <Separator className="my-3" />

                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Created:</span>
                    <span className="text-xs">
                      {mode === 'edit' && project 
                        ? formatDate(project.createdAt)
                        : formatDate(new Date().toISOString())
                      }
                    </span>
                  </div>
                  {mode === 'edit' && project?.lastModified && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Modified:</span>
                      <span className="text-xs">{formatDate(project.lastModified)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                type="button"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button type="submit">
                {mode === 'create' ? 'Create Project' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
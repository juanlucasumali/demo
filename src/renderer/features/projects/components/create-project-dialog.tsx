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
import { Project, Tag } from "@/renderer/components/layout/types"
import { Badge } from "@/renderer/components/ui/badge"
import { formatDate } from "@/renderer/lib/utils"
import { Separator } from "@/renderer/components/ui/separator"
import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/renderer/components/ui/popover"

const DEFAULT_TAG_COLOR = 'gray'

const tagColorClasses = {
  gray: 'bg-gray-500',
  blue: 'bg-blue-500',
  red: 'bg-red-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  purple: 'bg-purple-500',
  pink: 'bg-pink-500',
  orange: 'bg-orange-500',
  indigo: 'bg-indigo-500'
} as const

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
  onProjectCreate: (project: Partial<Project>) => void
}

export function CreateProjectDialog({ onProjectCreate }: CreateProjectDialogProps) {
  const [isStarred, setIsStarred] = useState(false)
  const [tags, setTags] = useState<Tag[]>([])

  const tagColors = [
    'gray', 'blue', 'red', 'green', 'yellow', 'purple', 'pink', 'orange', 'indigo'
  ]

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      tags: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    const newProject: Partial<Project> = {
      name: values.name,
      logo: null,
      description: values.description,
      isStarred: isStarred,
      dateCreated: new Date().toISOString(),
      dateModified: new Date().toISOString(),
      tags: tags // Use the tags state directly
    }
  
    onProjectCreate(newProject)
    form.reset()
    setTags([])
    setIsStarred(false)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="gap-2">
          <IconPlus size={16} />
          <span>New Project</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Add a new project to your workspace. Fill in the details below.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Preview Card */}
            <div className="rounded-lg border p-4 hover:shadow-md transition-shadow w-[450px]"> {/* or whatever width matches your design */}
              <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 p-2 text-white">
                    📁
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
                        <div className="relative">
                          <Input 
                            placeholder="Project description..."
                            maxLength={60}
                            className="border-0 p-0 h-[24px] focus-visible:ring-0 text-sm text-gray-500 bg-transparent shadow-none"
                            {...field}
                          />
                          <span className="absolute right-0 bottom-0 text-xs text-muted-foreground">
                            {field.value.length}/60
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4 max-w-full">
                  <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              placeholder="Add tags (comma-separated)"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e)
                                const newTagNames = e.target.value.split(',')
                                  .map(tag => tag.trim().toLowerCase())
                                  .filter(tag => tag !== '')
                                  .filter((tag, index, self) => self.indexOf(tag) === index)
                                
                                const newTags = newTagNames.map(tagName => {
                                  const existingTag = tags.find(t => t.name === tagName)
                                  return existingTag || {
                                    name: tagName,
                                    color: DEFAULT_TAG_COLOR // All new tags start as gray
                                  }
                                })
                                setTags(newTags)
                              }}
                              className="max-w-full"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  {/* Then update the tags container */}
                    {tags.length > 0 && (
                      <div className="w-full overflow-x-auto no-scrollbar">
                        <div className="flex gap-2 flex-nowrap" style={{ maxWidth: "400px" }}> {/* or slightly less than card width */}
                          {tags.map((tag, index) => (
                            <Popover key={index}>
                              <PopoverTrigger>
                                <Badge
                                  variant="secondary"
                                  className={`whitespace-nowrap flex-shrink-0 px-2 py-0.5 ${
                                    tagBgClasses[tag.color as keyof typeof tagBgClasses]
                                  } group`}
                                >
                                  <span className="">{tag.name}</span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      e.preventDefault()
                                      const newTags = [...tags]
                                      newTags.splice(index, 1)
                                      setTags(newTags)
                                      form.setValue('tags', newTags.map(t => t.name).join(','))
                                    }}
                                    className="ml-1 opacity-0 group-hover:opacity-100 flex-shrink-0"
                                  >
                                    ×
                                  </button>
                                </Badge>
                              </PopoverTrigger>
                                <PopoverContent className="w-32 p-2">
                                  <div className="grid grid-cols-4 gap-1">
                                    {tagColors.map((color) => (
                                      <button
                                        key={color}
                                        className={`w-6 h-6 rounded-md ${tagColorClasses[color as keyof typeof tagColorClasses]}`}
                                        onClick={() => {
                                          const newTags = [...tags]
                                          newTags[index].color = color
                                          setTags(newTags)
                                        }}
                                      />
                                    ))}
                                  </div>
                                </PopoverContent>
                              </Popover>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                <Separator className="my-3" />

                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Created:</span>
                    <span className="text-xs">{formatDate(new Date().toISOString())}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <DialogTrigger asChild>
                <Button variant="outline">Cancel</Button>
              </DialogTrigger>
              <Button type="submit">
                Create Project
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
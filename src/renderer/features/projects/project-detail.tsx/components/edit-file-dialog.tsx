import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/renderer/components/ui/dialog"
import { Button } from "@/renderer/components/ui/button"
import { Input } from "@/renderer/components/ui/input"
import { Textarea } from "@/renderer/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/renderer/components/ui/form"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/renderer/components/ui/accordion"
import { Badge } from "@/renderer/components/ui/badge"
import { useProjectItemsStore } from '@/renderer/stores/useProjectItemsStore'
import { ProjectItem } from '@/renderer/features/tasks/data/schema'
import { FILE_TAGS, FileTags } from '@/renderer/components/layout/types'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { IconEdit } from "@tabler/icons-react"
import { Circle, CircleDot, Square, SquareCheck } from "lucide-react"
import { useToast } from "@/renderer/hooks/use-toast"

const formSchema = z.object({
  name: z.string()
    .min(2, { message: "File name must be at least 2 characters." })
    .max(60, { message: "File name cannot exceed 60 characters." }),
  description: z.string()
    .max(60, { message: "Description cannot exceed 60 characters." }),
})

interface EditFileDialogProps {
  file: ProjectItem
  trigger?: React.ReactNode
  isOpen?: boolean
  onClose?: () => void
}

export function EditFileDialog({ 
  file, 
  trigger, 
  isOpen: controlledIsOpen,
  onClose 
}: EditFileDialogProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const isOpen = controlledIsOpen ?? internalIsOpen

  console.log("FILE??", file)

  // Initialize tags state with existing file tags
  const [selectedTags, setSelectedTags] = useState<Record<FileTags, string[]>>(() => {
    // Create initial empty state
    const initialTags: Record<FileTags, string[]> = {
      type: [],
      instrument: [],
      status: [],
      version: [],
    }

    // If file has tags, categorize them
    if (file.tags && file.tags.length > 0) {
      file.tags.forEach(tag => {
        // Check each category to find where this tag belongs
        Object.entries(FILE_TAGS).forEach(([category, config]) => {
          if (config.options.includes(tag)) {
            initialTags[category as FileTags].push(tag)
          }
        })
      })
    }

    return initialTags
  })

  // Handle tag selection
  const handleTagSelect = (category: FileTags, tag: string) => {
    setSelectedTags(prev => {
      const newTags = { ...prev }
      const categoryTags = [...prev[category]]
      const tagIndex = categoryTags.indexOf(tag)

      if (tagIndex === -1) {
        // Tag is not selected
        if (FILE_TAGS[category].allowMultiple) {
          // For multiple-select categories, add to existing tags
          newTags[category] = [...categoryTags, tag]
        } else {
          // For single-select categories, replace existing tag
          newTags[category] = [tag]
        }
      } else {
        // Tag is already selected, remove it
        categoryTags.splice(tagIndex, 1)
        newTags[category] = categoryTags
      }

      return newTags
    })
  }

  // Reset form and tags to original values
  const resetForm = () => {
    form.reset({
      name: file.name,
      description: file.description || "",
    })

    // Reset tags to original file tags
    const initialTags: Record<FileTags, string[]> = {
      type: [],
      instrument: [],
      status: [],
      version: [],
    }

    if (file.tags && file.tags.length > 0) {
      file.tags.forEach(tag => {
        Object.entries(FILE_TAGS).forEach(([category, config]) => {
          if (config.options.includes(tag)) {
            initialTags[category as FileTags].push(tag)
          }
        })
      })
    }

    setSelectedTags(initialTags)
  }

  const updateItem = useProjectItemsStore((state) => state.updateItem)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: file.name,
      description: file.description || "",
    },
    mode: "onChange",
  })

  const handleClose = () => {
    if (onClose) {
      onClose()
    } else {
      setInternalIsOpen(false)
    }
    resetForm()
  }

  const handleOpenChange = (open: boolean) => {
    if (onClose && !open) {
      onClose()
    } else {
      setInternalIsOpen(open)
    }

    if (!open) {
      resetForm()
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const allTags = Object.values(selectedTags).flat()

    try {
      await updateItem(file.id, {
        name: values.name,
        description: values.description,
        tags: allTags,
      })

      handleClose()
      toast({
        title: "Success",
        description: "File updated successfully",
      })
    } catch (error) {
      console.error('Failed to update file:', error)
      toast({
        title: "Error",
        description: "Failed to update file",
        variant: "destructive"
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild onClick={(e) => {
        e.stopPropagation()
      }}>
        {trigger ?? (
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2"
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
            }}
          >
            <IconEdit size={16} />
            <span>Edit File</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]" onClick={(e) => {
        e.stopPropagation()
      }}>
        <DialogHeader>
          <DialogTitle>Edit File</DialogTitle>
          <DialogDescription>
            Update file details and tags.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="rounded-lg border p-4 space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        placeholder="File Name" 
                        {...field}
                        maxLength={30}
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
                  <FormItem>
                    <FormControl>
                      <Textarea 
                        placeholder="Description..."
                        maxLength={60}
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Accordion type="single" collapsible className="w-full">
              {Object.entries(FILE_TAGS).map(([category, config]) => (
                <AccordionItem key={category} value={category}>
                  <AccordionTrigger className="text-sm hover:no-underline capitalize">
                    {category}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-2 gap-1 p-1">
                      {config.options.map((option) => {
                        const isSelected = selectedTags[category as FileTags].includes(option)
                        return (
                          <Button
                            key={option}
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="justify-start"
                            onClick={() => handleTagSelect(category as FileTags, option)}
                          >
                            <div className="flex items-center gap-2">
                              {config.allowMultiple ? (
                                isSelected ? (
                                  <SquareCheck className="h-4 w-4" />
                                ) : (
                                  <Square className="h-4 w-4" />
                                )
                              ) : (
                                isSelected ? (
                                  <CircleDot className="h-4 w-4" />
                                ) : (
                                  <Circle className="h-4 w-4" />
                                )
                              )}
                              <span className="truncate">{option}</span>
                            </div>
                          </Button>
                        )
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {/* Selected tags display */}
            {Object.values(selectedTags).some(tags => tags.length > 0) && (
              <div className="w-full overflow-x-auto no-scrollbar">
                <div className="flex gap-2 flex-nowrap" style={{ maxWidth: "400px" }}>
                  {Object.entries(selectedTags).map(([category, tags]) =>
                    tags.map((tag) => (
                      <Badge
                        key={`${category}-${tag}`}
                        variant="secondary"
                        className={`whitespace-nowrap flex-shrink-0 ${
                          colorClasses[FILE_TAGS[category as FileTags].color]
                        }`}
                      >
                        {tag}
                      </Badge>
                    ))
                  )}
                </div>
              </div>
            )}
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
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

// Add this at the top of the file with other imports
const colorClasses = {
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  green: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  red: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  pink: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
  sky: 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300',
  orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
}

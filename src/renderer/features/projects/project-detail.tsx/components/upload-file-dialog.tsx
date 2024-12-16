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
import { IconPlus } from "@tabler/icons-react"
import { Circle, CircleDot, Square, SquareCheck } from "lucide-react"
import { useToast } from "@/renderer/hooks/use-toast"
import { useAuth } from '@/renderer/stores/useAuthStore'

const formSchema = z.object({
  name: z.string()
    .min(2, { message: "File name must be at least 2 characters." })
    .max(60, { message: "File name cannot exceed 60 characters." }),
  description: z.string()
    .max(60, { message: "Description cannot exceed 60 characters." }),
})

interface UploadFileDialogProps {
  projectId: string
  trigger?: React.ReactNode
}

export function UploadFileDialog({ projectId, trigger }: UploadFileDialogProps) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [selectedTags, setSelectedTags] = useState<Record<string, string[]>>({
    type: [],
    instrument: [],
    status: [],
    version: [],
  })
  const addFileItem = useProjectItemsStore((state) => state.addFileItem)
  const currentFolderId = useProjectItemsStore((state) => state.currentFolderId)
  const { toast } = useToast()
  const { user } = useAuth()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
    mode: "onChange",
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      form.setValue("name", selectedFile.name)
    }
  }

  const handleTagSelect = (category: FileTags, tag: string) => {
    setSelectedTags((prev) => {
      const categoryTags = [...prev[category]]
      const tagIndex = categoryTags.indexOf(tag)
  
      if (tagIndex === -1) {
        if (FILE_TAGS[category].allowMultiple) {
          categoryTags.push(tag)
        } else {
          return { ...prev, [category]: [tag] }
        }
      } else {
        categoryTags.splice(tagIndex, 1)
      }
  
      return { ...prev, [category]: categoryTags }
    })
  }

  const resetForm = () => {
    form.reset()
    setFile(null)
    setSelectedTags({
      type: [],
      instrument: [],
      status: [],
      version: [],
    })
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!file || !user) return

    const allTags = Object.values(selectedTags).flat()

    try {
      const newItem: Omit<ProjectItem, 'id' | 'createdAt' | 'lastModified'> = {
        name: values.name,
        description: values.description,
        type: 'file',
        isStarred: false,
        fileFormat: file.type,
        size: file.size,
        duration: null,
        ownerId: user.id,
        tags: allTags,
        projectId,
        parentFolderId: currentFolderId,
        filePath: null,
      }

        // Use the new addFileItem method
        await addFileItem(
          newItem,
          file,
          (hashProgress) => {
            // Handle hash calculation progress
            console.log('Hash progress:', hashProgress)
          },
          (uploadProgress) => {
            // Handle upload progress
            console.log('Upload progress:', uploadProgress)
          }
        )

      setOpen(false)
      resetForm()
      toast({
        title: "Success",
        description: "File uploaded successfully",
      })
    } catch (error) {
      console.error('Failed to upload file:', error)
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive"
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="default" size="sm" className="gap-2">
            <IconPlus size={16} />
            <span>Upload File</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
          <DialogDescription>
            Upload a file to your project. Add details and tags below.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="rounded-lg border p-4 space-y-4">
              <Input
                type="file"
                onChange={handleFileChange}
                className="w-full"
              />
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        placeholder="File name" 
                        {...field}
                        maxLength={100}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* <FormField
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
              /> */}

              <Accordion type="single" collapsible className="w-full">
                {Object.entries(FILE_TAGS).map(([category, { options, color }], categoryIndex) => (
                  <AccordionItem key={category} value={category}>
                    <AccordionTrigger className="text-sm hover:no-underline capitalize">
                      {category}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 gap-1 p-1">
                        {options.map((option) => (
                          <Button
                            key={option}
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="justify-start"
                            onClick={() => handleTagSelect(category as FileTags, option)}
                          >
                            <div className="flex items-center gap-2">
                              {FILE_TAGS[category].allowMultiple ? (
                                // Use squares for categories that allow multiple selections
                                selectedTags[category].includes(option) ? (
                                  <SquareCheck className="h-4 w-4" />
                                ) : (
                                  <Square className="h-4 w-4" />
                                )
                              ) : (
                                // Use circles for categories that only allow single selection
                                selectedTags[category].includes(option) ? (
                                  <CircleDot className="h-4 w-4" />
                                ) : (
                                  <Circle className="h-4 w-4" />
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

              {/* Selected tags display */}
              {Object.entries(selectedTags).some(([_, tags]) => tags.length > 0) && (
                <div className="w-full overflow-x-auto no-scrollbar">
                  <div className="flex gap-2 flex-nowrap" style={{ maxWidth: "400px" }}>
                    {Object.entries(selectedTags).map(([category, tags]) =>
                      tags.map((tag) => (
                        <Badge
                          key={`${category}-${tag}`}
                          variant="secondary"
                          className={`bg-${FILE_TAGS[category as FileTags].color}-100 text-${FILE_TAGS[category as FileTags].color}-700 `}
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
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!file}>
                Upload
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

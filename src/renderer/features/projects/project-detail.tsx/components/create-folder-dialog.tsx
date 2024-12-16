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
import { IconFolderPlus } from "@tabler/icons-react"
import { useState } from "react"
import { useProjectItemsStore } from "@/renderer/stores/useProjectItemsStore"
import { useToast } from "@/renderer/hooks/use-toast"
import { useAuthStore } from "@/renderer/stores/useAuthStore"

interface CreateFolderDialogProps {
  projectId: string
  parentFolderId: string | null
  trigger?: React.ReactNode
  isOpen?: boolean
  onClose?: () => void
}

type FormValues = {
  name: string
  description: string
}

export function CreateFolderDialog({ 
  projectId, 
  parentFolderId, 
  trigger, 
  isOpen: controlledIsOpen, 
  onClose 
}: CreateFolderDialogProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const isOpen = controlledIsOpen ?? internalIsOpen
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuthStore()
  const { toast } = useToast()
  const addItem = useProjectItemsStore((state) => state.addItem)

  const form = useForm<FormValues>({
    defaultValues: {
      name: "",
      description: "",
    },
  })

  const resetForm = () => {
    form.reset()
  }

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

  async function onSubmit(values: FormValues) {
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

      const folderData = {
        name: values.name,
        description: values.description,
        type: 'folder' as const,
        isStarred: false,
        fileFormat: null,
        size: null,
        duration: null,
        lastModified: null,
        createdAt: null,
        ownerId: user.id,
        tags: [],
        projectId,
        parentFolderId,
        filePath: null
      }

      await addItem(folderData)
      
      toast({
        title: "Success",
        description: "Folder created successfully",
      })
      
      handleClose()
    } catch (error) {
      console.error('Error creating folder:', error)
      toast({
        title: "Error",
        description: "Failed to create folder",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm" className="gap-2">
            <IconFolderPlus size={16} />
            <span>New Folder</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
          <DialogDescription>
            Create a new folder to organize your files.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input 
                      placeholder="Folder Name" 
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
                    <Input 
                      placeholder="Description (optional)"
                      {...field}
                      maxLength={60}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                type="button"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                Create Folder
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

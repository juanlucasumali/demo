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
import { IconEdit } from "@tabler/icons-react"
import { useState } from "react"
import { useProjectItemsStore } from "@/renderer/stores/useProjectItemsStore"
import { useToast } from "@/renderer/hooks/use-toast"
import { ProjectItem } from "@/renderer/features/tasks/data/schema"

interface EditFolderDialogProps {
  folder: ProjectItem
  trigger?: React.ReactNode
  isOpen?: boolean
  onClose?: () => void
}

type FormValues = {
  name: string
  description: string
}

export function EditFolderDialog({ 
  folder,
  trigger, 
  isOpen: controlledIsOpen, 
  onClose 
}: EditFolderDialogProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const isOpen = controlledIsOpen ?? internalIsOpen
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const updateItem = useProjectItemsStore((state) => state.updateItem)

  const form = useForm<FormValues>({
    defaultValues: {
      name: folder.name,
      description: folder.description || "",
    },
  })

  const resetForm = () => {
    form.reset({
      name: folder.name,
      description: folder.description || "",
    })
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

      console.log("Gonna call update item!")

      await updateItem(folder.id, {
        name: values.name,
        description: values.description,
      })
      
      toast({
        title: "Success",
        description: "Folder updated successfully",
      })
      
      handleClose()
    } catch (error) {
      console.error('Error updating folder:', error)
      toast({
        title: "Error",
        description: "Failed to update folder",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild onClick={(e) => {
      }}>
        {trigger ?? (
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2"
            onClick={(e) => {
            }}
          >
            <IconEdit size={16} />
            <span>Edit Folder</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" onClick={(e) => {
      }}>
        <DialogHeader>
          <DialogTitle>Edit Folder</DialogTitle>
          <DialogDescription>
            Modify the folder's details.
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
                onClick={(e) => {
                  handleClose()
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

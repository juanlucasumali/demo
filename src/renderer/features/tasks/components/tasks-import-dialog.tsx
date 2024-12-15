import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from '@/renderer/hooks/use-toast'
import { Button } from '@/renderer/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/renderer/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/renderer/components/ui/form'
import { Input } from '@/renderer/components/ui/input'

// Allowed file types - extend as needed
const ALLOWED_FILE_TYPES = [
  'audio/mpeg',
]

const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB

const formSchema = z.object({
  files: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, {
      message: 'Please select at least one file',
    })
    .refine(
      (files) => {
        for (let i = 0; i < files.length; i++) {
          if (!ALLOWED_FILE_TYPES.includes(files[i].type)) {
            return false
          }
        }
        return true
      },
      'One or more files are not in an allowed format'
    )
    .refine(
      (files) => {
        for (let i = 0; i < files.length; i++) {
          if (files[i].size > MAX_FILE_SIZE) {
            return false
          }
        }
        return true
      },
      'One or more files exceed the maximum size of 100MB'
    ),
})

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UploadDialog({ open, onOpenChange }: Props) {

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { files: undefined },
  })

  const fileRef = form.register('files')

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const files = Array.from(data.files)
      const uploadPromises = files.map(async (file) => {
        // Here you would implement your actual file upload logic
        // This is just a simulation
        await new Promise(resolve => setTimeout(resolve, 1000))
        return {
          name: file.name,
          size: file.size,
          type: file.type,
        }
      })

      const uploadedFiles = await Promise.all(uploadPromises)

      toast({
        title: 'Files uploaded successfully',
        description: (
          <pre className='mt-2 w-[340px] rounded-md bg-slate-950 p-4'>
            <code className='text-white'>
              {JSON.stringify(uploadedFiles, null, 2)}
            </code>
          </pre>
        ),
      })

      onOpenChange(false)
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'There was an error uploading your files.',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val)
        form.reset()
      }}
    >
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
          <DialogDescription>
            Upload files to your project. Maximum file size is 100MB.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id='file-upload-form' onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name='files'
              render={() => (
                <FormItem className='space-y-1 mb-2'>
                  <FormLabel>Files</FormLabel>
                  <FormControl>
                    <Input 
                      type='file' 
                      {...fileRef} 
                      multiple 
                      className='h-8'
                      accept={ALLOWED_FILE_TYPES.join(',')}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-sm text-muted-foreground">
                    Allowed types: {ALLOWED_FILE_TYPES.map(type => type.split('/')[1]).join(', ')}
                  </p>
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='outline'>Cancel</Button>
          </DialogClose>
          <Button 
            type='submit' 
            form='file-upload-form'
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

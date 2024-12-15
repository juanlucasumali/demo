import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from '@/renderer/hooks/use-toast'
import { Button } from '@/renderer/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/renderer/components/ui/form'
import { Input } from '@/renderer/components/ui/input'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/renderer/components/ui/sheet'
import { ProjectItem } from '../data/schema'
import { useState } from 'react'
import { Badge } from '@/renderer/components/ui/badge'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentItem?: ProjectItem
  type: 'file' | 'folder'
}

const formSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  tags: z.array(z.string()).nullable(),
})

type ProjectItemForm = z.infer<typeof formSchema>

export function ProjectItemMutateDrawer({ 
  open, 
  onOpenChange, 
  currentItem,
  type 
}: Props) {
  const isUpdate = !!currentItem

  const form = useForm<ProjectItemForm>({
    resolver: zodResolver(formSchema),
    defaultValues: currentItem 
      ? { 
          name: currentItem.name,
          tags: currentItem.tags 
        }
      : {
          name: '',
          tags: null
        },
  })

  const onSubmit = (data: ProjectItemForm) => {
    // Create new ProjectItem
    const newItem: Partial<ProjectItem> = {
      name: data.name,
      type: type,
      tags: data.tags,
      lastModified: new Date(),
      dateCreated: new Date(),
      owner: 'Current User', // Get from auth context
      starred: false,
      fileFormat: type === 'file' ? 'unknown' : null,
      size: null,
      duration: null,
    }

    // do something with the form data
    onOpenChange(false)
    form.reset()
    toast({
      title: `${isUpdate ? 'Updated' : 'Created'} ${type} successfully`,
      description: (
        <pre className='mt-2 w-[340px] rounded-md bg-slate-950 p-4'>
          <code className='text-white'>{JSON.stringify(newItem, null, 2)}</code>
        </pre>
      ),
    })
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        form.reset()
      }}
    >
      <SheetContent className='flex flex-col'>
        <SheetHeader>
          <SheetTitle>
            {isUpdate ? 'Rename' : 'Create'} {type}
          </SheetTitle>
          <SheetDescription>
            {isUpdate
              ? `Rename the ${type} by providing a new name.`
              : `Create a new ${type} by providing necessary info.`}
            Click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id='project-item-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-5 flex-1'
          >
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder={`Enter ${type} name`}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='tags'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <TagInput
                      value={field.value || []}
                      onChange={field.onChange}
                      placeholder="Add tags..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <SheetFooter className='gap-2'>
          <SheetClose asChild>
            <Button variant='outline'>Cancel</Button>
          </SheetClose>
          <Button form='project-item-form' type='submit'>
            {isUpdate ? 'Update' : 'Create'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

// TagInput component (create this in a separate file)
interface TagInputProps {
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
}

export function TagInput({ value, onChange, placeholder }: TagInputProps) {
  const [inputValue, setInputValue] = useState('')

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue) {
      e.preventDefault()
      onChange([...value, inputValue])
      setInputValue('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove))
  }

  return (
    <div className="flex flex-wrap gap-2 p-2 border rounded-md">
      {value?.map(tag => (
        <Badge 
          key={tag} 
          variant="secondary"
          className="gap-1"
        >
          {tag}
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0"
            onClick={() => removeTag(tag)}
          >
            ×
          </Button>
        </Badge>
      ))}
      <Input
        type="text"
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="border-none shadow-none"
      />
    </div>
  )
}

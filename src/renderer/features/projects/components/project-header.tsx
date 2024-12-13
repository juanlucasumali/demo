import { Input } from '@/renderer/components/ui/input'
import { Tag } from 'lucide-react'
import { Badge } from "@/renderer/components/ui/badge"
import { Button } from "@/renderer/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/renderer/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/renderer/components/ui/popover"
import { Square, SquareCheck } from 'lucide-react'
import { useState } from 'react'

interface ProjectHeaderProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  selectedTags: string[]
  setSelectedTags: (tags: string[]) => void
  allTags: string[]
}

export const ProjectHeader = ({
  searchTerm,
  setSearchTerm,
  selectedTags,
  setSelectedTags,
  allTags,
}: ProjectHeaderProps) => {
  const [openTagFilter, setOpenTagFilter] = useState(false)

  const toggleTag = (tag: string) => {
    setSelectedTags(
      selectedTags.includes(tag)
        ? selectedTags.filter(t => t !== tag)
        : [...selectedTags, tag]
    )
  }

  return (
    <div className='flex gap-4 sm:my-4'>
      <Input
        placeholder='Filter projects...'
        className='h-9 w-40 lg:w-[250px]'
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <Popover open={openTagFilter} onOpenChange={setOpenTagFilter}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="h-9 justify-between">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <span>Tags</span>
            </div>
            {selectedTags.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {selectedTags.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <Command className="max-h-[300px]">
            <CommandInput placeholder="Search tags..." />
            <CommandEmpty>No tags found.</CommandEmpty>
            {selectedTags.length > 0 && (
              <div className="border-b border-border px-2 py-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-full justify-start text-sm"
                  onClick={() => setSelectedTags([])}
                >
                  Clear all tags
                </Button>
              </div>
            )}
            <CommandGroup className="overflow-auto max-h-[225px]">
              {allTags.map(tag => (
                <CommandItem
                  key={tag}
                  onSelect={() => toggleTag(tag)}
                >
                  <div className="flex items-center gap-2 flex-1">
                    {selectedTags.includes(tag) ? (
                      <SquareCheck className="h-4 w-4" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                    {tag}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

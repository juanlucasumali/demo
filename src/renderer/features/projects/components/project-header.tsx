import { Input } from '@/renderer/components/ui/input'
import { Circle, CircleDot, Square, SquareCheck, Tag } from 'lucide-react'
import { Badge } from "@/renderer/components/ui/badge"
import { Button } from "@/renderer/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/renderer/components/ui/popover"
import { useState } from 'react'
import { PROJECT_TAGS, TagCategory } from "@/renderer/components/layout/types"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/renderer/components/ui/accordion"
import { ScrollArea } from "@/renderer/components/ui/scroll-area"

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
}: ProjectHeaderProps) => {
  const [openTagFilter, setOpenTagFilter] = useState(false)
  const [searchTagTerm, setSearchTagTerm] = useState('')

  const toggleTag = (category: TagCategory, tag: string) => {
    if (category === 'stage') {
      // For stage category, deselect current stage tag if exists and select new one
      const newTags = selectedTags.filter(t => !t.startsWith('stage:'))
      if (!selectedTags.includes(`${category}:${tag}`)) {
        newTags.push(`${category}:${tag}`)
      }
      setSelectedTags(newTags)
    } else {
      // For other categories, maintain existing toggle behavior
      setSelectedTags(
        selectedTags.includes(`${category}:${tag}`)
          ? selectedTags.filter(t => t !== `${category}:${tag}`)
          : [...selectedTags, `${category}:${tag}`]
      )
    }
  }  

  // Filter tags based on search term
  const filterTags = (options: readonly string[]) => {
    return [...options].filter(tag => 
      tag.toLowerCase().includes(searchTagTerm.toLowerCase())
    )
  }

  // Count selected tags by category
  const getSelectedTagsCount = (category: TagCategory) => {
    return PROJECT_TAGS[category].options.filter(tag => 
      selectedTags.includes(`${category}:${tag}`)
    ).length
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
        <PopoverContent className="w-[300px] p-0" align="start">
          <div className="flex flex-col h-[400px]">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-background p-4 border-b">
              <Input
                placeholder="Search tags..."
                value={searchTagTerm}
                onChange={(e) => setSearchTagTerm(e.target.value)}
                className="h-8"
              />
            </div>

            {/* Scrollable Content */}
            <ScrollArea className="flex-1 pl-4 pr-4">
              <Accordion type="multiple" className="w-full">
                {(Object.entries(PROJECT_TAGS) as [TagCategory, typeof PROJECT_TAGS[TagCategory]][]).map(([category, config]) => {
                  const filteredOptions = filterTags(config.options)
                  if (filteredOptions.length === 0) return null
                  
                  return (
                    <AccordionItem value={category} key={category}>
                      <AccordionTrigger className="text-sm hover:no-underline">
                        <div className="flex items-center gap-2">
                          <span className="capitalize">{category}</span>
                          <Badge 
                            variant="secondary" 
                            className={`bg-${config.color}-100 text-${config.color}-700 ${
                              getSelectedTagsCount(category) === 0 ? 'invisible' : ''
                            }`}
                          >
                            {getSelectedTagsCount(category)}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-2 gap-1 p-1">
                          {filteredOptions.map((option) => (
                            <Button
                              key={option}
                              variant="ghost"
                              size="sm"
                              className={`justify-start ${
                                selectedTags.includes(`${category}:${option}`) 
                              }`}
                              onClick={() => toggleTag(category, option)}
                            >
                              <div className="flex items-center gap-2">
                                {category === 'stage' ? (
                                  // Use Circle icons for stage category
                                  selectedTags.includes(`${category}:${option}`) ? (
                                    <CircleDot className="h-4 w-4" />
                                  ) : (
                                    <Circle className="h-4 w-4" />
                                  )
                                ) : (
                                  // Use Square icons for other categories
                                  selectedTags.includes(`${category}:${option}`) ? (
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
                  )
                })}
              </Accordion>
            </ScrollArea>

            {/* Sticky Footer - Only shown when tags are selected */}
            {selectedTags.length > 0 && (
              <div className="sticky bottom-0 z-10 bg-background p-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-full justify-center text-sm"
                  onClick={() => setSelectedTags([])}
                >
                  Clear all tags
                </Button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

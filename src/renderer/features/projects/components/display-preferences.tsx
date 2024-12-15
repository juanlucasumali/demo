import { useState } from 'react'
import { Settings2, Square, SquareCheck} from 'lucide-react'
import { Button } from "@/renderer/components/ui/button"
import {
  Command,
  CommandGroup,
  CommandItem,
} from "@/renderer/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/renderer/components/ui/popover"

interface DisplayPreferencesProps {
  displayPreferences: {
    tags: boolean
    createdAt: boolean
    lastModified: boolean
  }
  setDisplayPreferences: (preferences: {
    tags: boolean
    createdAt: boolean
    lastModified: boolean
  }) => void
}

export const DisplayPreferences = ({ 
  displayPreferences, 
  setDisplayPreferences 
}: DisplayPreferencesProps) => {
  const [open, setOpen] = useState(false)

  const handleCheckboxClick = (key: keyof typeof displayPreferences) => {
    setDisplayPreferences({
      ...displayPreferences,
      [key]: !displayPreferences[key]
    })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="h-9 w-9">
          <Settings2 className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px]" align="end">
        <Command className="w-full">
          <CommandGroup>
            <CommandItem
              onSelect={() => handleCheckboxClick('tags')}
            >
              <div className="flex items-center gap-2 flex-1">
                {displayPreferences.tags ? (
                  <SquareCheck className="h-4 w-4" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
                <span>Show Tags</span>
              </div>
            </CommandItem>

            <CommandItem
              onSelect={() => handleCheckboxClick('createdAt')}
            >
              <div className="flex items-center gap-2 flex-1">
                {displayPreferences.createdAt ? (
                  <SquareCheck className="h-4 w-4" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
                <span>Created Date</span>
              </div>
            </CommandItem>

            <CommandItem
              onSelect={() => handleCheckboxClick('lastModified')}
            >
              <div className="flex items-center gap-2 flex-1">
                {displayPreferences.lastModified ? (
                  <SquareCheck className="h-4 w-4" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
                <span>Modified Date</span>
              </div>
            </CommandItem>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
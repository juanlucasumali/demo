import { useState } from 'react'
import { Settings2, Square, SquareCheck } from 'lucide-react'
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
    createdAt: boolean // Changed from createdAt
    lastModified: boolean
  }
  setDisplayPreferences: (preferences: {
    tags: boolean
    createdAt: boolean // Changed from createdAt
    lastModified: boolean
  }) => void
}

export const DisplayPreferences = ({ 
  displayPreferences, 
  setDisplayPreferences 
}: DisplayPreferencesProps) => {
  const [open, setOpen] = useState(false)

  const preferences = [
    {
      key: 'tags' as const,
      label: 'Show Tags',
      description: 'Display project tags'
    },
    {
      key: 'createdAt' as const, // Changed from createdAt
      label: 'Created Date',
      description: 'Show project creation date'
    },
    {
      key: 'lastModified' as const,
      label: 'Modified Date',
      description: 'Show last modified date'
    }
  ]

  const handleCheckboxClick = (key: keyof typeof displayPreferences) => {
    setDisplayPreferences({
      ...displayPreferences,
      [key]: !displayPreferences[key]
    })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-9 w-9"
          aria-label="Display preferences"
        >
          <Settings2 className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="end">
        <Command className="w-full">
          <CommandGroup heading="Display Options">
            {preferences.map(({ key, label, description }) => (
              <CommandItem
                key={key}
                onSelect={() => handleCheckboxClick(key)}
                className="px-2 py-1.5"
              >
                <div className="flex items-center gap-2 flex-1">
                  {displayPreferences[key] ? (
                    <SquareCheck className="h-4 w-4 text-primary" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{label}</span>
                    <span className="text-xs text-muted-foreground">
                      {description}
                    </span>
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

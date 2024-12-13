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

export const DisplayPreferences = ({ 
  displayPreferences, 
  setDisplayPreferences 
}: { 
  displayPreferences: {
    tags: boolean;
    dateCreated: boolean;
    dateModified: boolean;
  };
  setDisplayPreferences: React.Dispatch<React.SetStateAction<{
    tags: boolean;
    dateCreated: boolean;
    dateModified: boolean;
  }>>;
}) => {
  const [open, setOpen] = useState(false)

  const handleCheckboxClick = (key: keyof typeof displayPreferences) => {
    setDisplayPreferences(prev => ({ ...prev, [key]: !prev[key] }))
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
              onSelect={() => handleCheckboxClick('dateCreated')}
            >
              <div className="flex items-center gap-2 flex-1">
                {displayPreferences.dateCreated ? (
                  <SquareCheck className="h-4 w-4" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
                <span>Created Date</span>
              </div>
            </CommandItem>

            <CommandItem
              onSelect={() => handleCheckboxClick('dateModified')}
            >
              <div className="flex items-center gap-2 flex-1">
                {displayPreferences.dateModified ? (
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
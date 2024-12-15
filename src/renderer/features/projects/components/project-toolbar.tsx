import { IconSortAscendingLetters, IconSortDescendingLetters } from '@tabler/icons-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/renderer/components/ui/select'
import { DisplayPreferences } from './display-preferences'

interface ProjectToolbarProps {
  sort: string
  setSort: (sort: string) => void
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

export const ProjectToolbar = ({
  sort,
  setSort,
  displayPreferences,
  setDisplayPreferences,
}: ProjectToolbarProps) => {
  return (
    <div className="flex items-center gap-2">
      <DisplayPreferences 
        displayPreferences={displayPreferences}
        setDisplayPreferences={setDisplayPreferences}
      />
      <Select value={sort} onValueChange={setSort}>
        <SelectTrigger className='w-[200px]'>
          <SelectValue>
            {sort === 'ascending' && <div className='flex items-center gap-2'><IconSortAscendingLetters size={16} />Name (A-Z)</div>}
            {sort === 'descending' && <div className='flex items-center gap-2'><IconSortDescendingLetters size={16} />Name (Z-A)</div>}
            {sort === 'createdAt' && <div className='flex items-center gap-2'>Date Created</div>}
            {sort === 'lastModified' && <div className='flex items-center gap-2'>Last Modified</div>}
          </SelectValue>
        </SelectTrigger>
        <SelectContent align='end'>
          <SelectItem value='ascending'>
            <div className='flex items-center gap-4'>
              <IconSortAscendingLetters size={16} />
              <span>Name (A-Z)</span>
            </div>
          </SelectItem>
          <SelectItem value='descending'>
            <div className='flex items-center gap-4'>
              <IconSortDescendingLetters size={16} />
              <span>Name (Z-A)</span>
            </div>
          </SelectItem>
          <SelectItem value='createdAt'>
            <div className='flex items-center gap-4'>
              <span>Date Created</span>
            </div>
          </SelectItem>
          <SelectItem value='lastModified'>
            <div className='flex items-center gap-4'>
              <span>Last Modified</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

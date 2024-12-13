import { useEffect, useState } from 'react'
import { 
  IconSortAscendingLetters,
  IconSortDescendingLetters,
  IconStar,
  IconStarFilled,
} from '@tabler/icons-react'
import { Settings2, Square, SquareCheck, Tag} from 'lucide-react'
import { Badge } from "@/renderer/components/ui/badge"
import { Button } from "@/renderer/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/renderer/components/ui/command"
import { Input } from '@/renderer/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/renderer/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/renderer/components/ui/select'
import { Separator } from '@/renderer/components/ui/separator'
import { Header } from '@/renderer/components/layout/header'
import { Main } from '@/renderer/components/layout/main'
import { ProfileDropdown } from '@/renderer/components/profile-dropdown'
import { Search } from '@/renderer/components/search'
import { ThemeSwitch } from '@/renderer/components/theme-switch'
import { projects } from './data/projects'
import { formatDate } from '@/renderer/lib/utils'

const DisplayPreferences = ({ 
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

export default function Projects() {
  const [sort, setSort] = useState(() => {
    const savedSort = localStorage.getItem('sortPreference')
    return savedSort || 'dateModified' // Default to dateModified if nothing in storage
  })
  const [displayPreferences, setDisplayPreferences] = useState({
    tags: true, 
    dateCreated: false,
    dateModified: false,
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [starredProjects, setStarredProjects] = useState(new Set())
  const [selectedTags, setSelectedTags] = useState<string[]>(() => {
    const savedTags = localStorage.getItem('selectedTags')
    return savedTags ? JSON.parse(savedTags) : []
  })
  const [openTagFilter, setOpenTagFilter] = useState(false)

  // At the top of your component, load saved preferences
  useEffect(() => {
    const savedPreferences = localStorage.getItem('displayPreferences')
    if (savedPreferences) {
      setDisplayPreferences(JSON.parse(savedPreferences))
    }
  }, [])

  // Update localStorage when preferences change
  useEffect(() => {
    localStorage.setItem('displayPreferences', JSON.stringify(displayPreferences))
  }, [displayPreferences])

  useEffect(() => {
    localStorage.setItem('sortPreference', sort)
  }, [sort])

  useEffect(() => {
    localStorage.setItem('selectedTags', JSON.stringify(selectedTags))
  }, [selectedTags])

  const toggleStar = (projectName: string) => {
    setStarredProjects(prev => {
      const newStarred = new Set(prev)
      if (newStarred.has(projectName)) {
        newStarred.delete(projectName)
      } else {
        newStarred.add(projectName)
      }
      return newStarred
    })
  }

  const allTags = Array.from(
    new Set(
      projects.flatMap(project => 
        project.tags.map(tag => tag.name)
      )
    )
  ).sort()

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const filteredProjects = projects
    .sort((a, b) => {
      switch (sort) {
        case 'ascending':
          return a.name.localeCompare(b.name)
        case 'descending':
          return b.name.localeCompare(a.name)
        case 'dateCreated':
          return new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
        case 'dateModified':
          return new Date(b.dateModified).getTime() - new Date(a.dateModified).getTime()
        default:
          return 0
      }
    })
    .filter((project) => project.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((project) => 
      selectedTags.length === 0 || 
      selectedTags.every(tag => 
        project.tags.some(projectTag => projectTag.name === tag)
      )
    )

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <Search />
        <div className='ml-auto flex items-center gap-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Content ===== */}
      <Main fixed>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>
            Projects
          </h1>
          <p className='text-muted-foreground'>
            What will you create today?
          </p>
        </div>
        <div className='my-4 flex items-end justify-between sm:my-0 sm:items-center'>
          <div className='flex flex-col gap-4 sm:my-4 sm:flex-row'>
            <Input
              placeholder='Filter projects...'
              className='h-9 w-40 lg:w-[250px]'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* Add Tag Filter */}
            <Popover open={openTagFilter} onOpenChange={setOpenTagFilter}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-9 justify-between"
                >
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

        <div className="flex items-center gap-2">
          <DisplayPreferences 
            displayPreferences={displayPreferences}
            setDisplayPreferences={setDisplayPreferences}
          />
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className='w-[200px]'> {/* Increased width to accommodate longer text */}
              <SelectValue>
                {sort === 'ascending' && <div className='flex items-center gap-2'><IconSortAscendingLetters size={16} />Name (A-Z)</div>}
                {sort === 'descending' && <div className='flex items-center gap-2'><IconSortDescendingLetters size={16} />Name (Z-A)</div>}
                {sort === 'dateCreated' && <div className='flex items-center gap-2'>Date Created</div>}
                {sort === 'dateModified' && <div className='flex items-center gap-2'>Last Modified</div>}
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
              <SelectItem value='dateCreated'>
                <div className='flex items-center gap-4'>
                  <span>Date Created</span>
                </div>
              </SelectItem>
              <SelectItem value='dateModified'>
                <div className='flex items-center gap-4'>
                  <span>Last Modified</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        </div>
        <Separator className='shadow' />
        <ul className='faded-bottom no-scrollbar grid gap-4 overflow-auto pb-16 pt-4 md:grid-cols-2 lg:grid-cols-3'>
          {filteredProjects.map((project) => (
            <li
            key={project.name}
            className='rounded-lg border p-4 hover:shadow-md cursor-pointer'
          >
            <div className='mb-8 flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <div className={`flex size-10 items-center justify-center rounded-lg bg-muted p-2`}>
                  {project.logo}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleStar(project.name)
                }}
                className='ml-2 text-gray-400 hover:text-yellow-400 dark:hover:text-yellow-300'
              >
                {starredProjects.has(project.name) 
                  ? <IconStarFilled size={20} className="text-yellow-400" /> 
                  : <IconStar size={20} />}
              </button>
            </div>
            <div>
              <h2 className='mb-1 font-semibold'>{project.name}</h2>
              <p className='line-clamp-2 text-gray-500 text-sm mb-4'>{project.desc}</p>
              
              {/* Conditional rendering for tags */}
              {displayPreferences.tags && (
                <div className="overflow-x-auto no-scrollbar mb-4">
                  <div className="flex gap-2 min-w-min">
                    {project.tags.map((tag) => (
                      <Badge
                        key={tag.name}
                        variant="secondary"
                        className={`whitespace-nowrap px-2 py-0.5
                          ${tag.color === 'blue' && 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'}
                          ${tag.color === 'green' && 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'}
                          ${tag.color === 'red' && 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}
                          ${tag.color === 'yellow' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'}
                          ${tag.color === 'purple' && 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'}
                          ${tag.color === 'pink' && 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300'}
                          ${tag.color === 'sky' && 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300'}
                          ${tag.color === 'orange' && 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'}
                        `}
                        >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {(displayPreferences.dateCreated || displayPreferences.dateModified) && (
                <Separator className="my-3" />
              )}

              {/* Conditional rendering for dates */}
              <div className="text-sm text-muted-foreground space-y-1">
                {displayPreferences.dateCreated && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Created:</span>
                    <span className="text-xs">{formatDate(project.dateCreated)}</span>
                  </div>
                )}
                {displayPreferences.dateModified && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Modified:</span>
                    <span className="text-xs">{formatDate(project.dateModified)}</span>
                  </div>
                )}
              </div>
            </div>
          </li>
          ))}
        </ul>
      </Main>
    </>
  )
}

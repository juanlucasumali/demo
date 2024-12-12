import { useState } from 'react'
import {
  IconAdjustmentsHorizontal,
  IconSortAscendingLetters,
  IconSortDescendingLetters,
} from '@tabler/icons-react'
import { Input } from '@/renderer/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/renderer/components/ui/select'
import { Separator } from '@/renderer/components/ui/separator'
import { Button } from '@/renderer/components/button'
import { Header } from '@/renderer/components/layout/header'
import { Main } from '@/renderer/components/layout/main'
import { ProfileDropdown } from '@/renderer/components/profile-dropdown'
import { Search } from '@/renderer/components/search'
import { ThemeSwitch } from '@/renderer/components/theme-switch'
import { projects } from './data/projects'

const projectText = new Map<string, string>([
  ['all', 'All Projects'],
  ['connected', 'Connected'],
  ['notConnected', 'Not Connected'],
])

export default function Projects() {
  const [sort, setSort] = useState('ascending')
  const [projectType, setProjectType] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredProjects = projects
    .sort((a, b) =>
      sort === 'ascending'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    )
    .filter((project) =>
      projectType === 'connected'
        ? project.connected
        : projectType === 'notConnected'
          ? !project.connected
          : true
    )
    .filter((project) => project.name.toLowerCase().includes(searchTerm.toLowerCase()))

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
            Project Integrations
          </h1>
          <p className='text-muted-foreground'>
            Here&apos;s a list of your projects for the integration!
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
            <Select value={projectType} onValueChange={setProjectType}>
              <SelectTrigger className='w-36'>
                <SelectValue>{projectText.get(projectType)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Projects</SelectItem>
                <SelectItem value='connected'>Connected</SelectItem>
                <SelectItem value='notConnected'>Not Connected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className='w-16'>
              <SelectValue>
                <IconAdjustmentsHorizontal size={18} />
              </SelectValue>
            </SelectTrigger>
            <SelectContent align='end'>
              <SelectItem value='ascending'>
                <div className='flex items-center gap-4'>
                  <IconSortAscendingLetters size={16} />
                  <span>Ascending</span>
                </div>
              </SelectItem>
              <SelectItem value='descending'>
                <div className='flex items-center gap-4'>
                  <IconSortDescendingLetters size={16} />
                  <span>Descending</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Separator className='shadow' />
        <ul className='faded-bottom no-scrollbar grid gap-4 overflow-auto pb-16 pt-4 md:grid-cols-2 lg:grid-cols-3'>
          {filteredProjects.map((project) => (
            <li
              key={project.name}
              className='rounded-lg border p-4 hover:shadow-md'
            >
              <div className='mb-8 flex items-center justify-between'>
                <div
                  className={`flex size-10 items-center justify-center rounded-lg bg-muted p-2`}
                >
                  {project.logo}
                </div>
                <Button
                  variant='outline'
                  size='sm'
                  className={`${project.connected ? 'border border-blue-300 bg-blue-50 hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-950 dark:hover:bg-blue-900' : ''}`}
                >
                  {project.connected ? 'Connected' : 'Connect'}
                </Button>
              </div>
              <div>
                <h2 className='mb-1 font-semibold'>{project.name}</h2>
                <p className='line-clamp-2 text-gray-500'>{project.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </Main>
    </>
  )
}

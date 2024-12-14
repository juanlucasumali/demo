import { useEffect, useMemo, useState } from 'react'
import { Separator } from '@/renderer/components/ui/separator'
import { Header } from '@/renderer/components/layout/header'
import { Main } from '@/renderer/components/layout/main'
import { ProfileDropdown } from '@/renderer/components/profile-dropdown'
import { Search } from '@/renderer/components/search'
import { ThemeSwitch } from '@/renderer/components/theme-switch'
import { projects as dummyProjects } from './data/projects'
import { ProjectHeader } from './components/project-header'
import { ProjectToolbar } from './components/project-toolbar'
import { useProjectsStore } from '@/renderer/stores/useProjectsStore'
import { useProjectFiltering } from '@/renderer/hooks/use-project-filtering'
import { ProjectList } from './components/project-list'
import { CreateProjectDialog } from './components/create-project-dialog'

export default function Projects() {
  const {
    projects,
    displayPreferences,
    sortPreference, 
    selectedTags,
    toggleStar,
    setDisplayPreferences,
    setSortPreference, 
    setSelectedTags,
  } = useProjectsStore()

  const [searchTerm, setSearchTerm] = useState('')

  const allTags = useMemo(() => 
    Array.from(
      new Set(projects.flatMap(project => project.tags.map(tag => tag.name)))
    ).sort(),
    [projects]
  )

  const { getFilteredAndSortedProjects } = useProjectFiltering({
    projects,
    searchTerm,
    selectedTags,
    sortPreference
  })

  const filteredProjects = useMemo(() => 
    getFilteredAndSortedProjects(),
    [projects, searchTerm, selectedTags, sortPreference]
  )

  useEffect(() => {
    const { setProjects } = useProjectsStore.getState()
    setProjects(dummyProjects)
  }, [])

  return (
    <>
      <Header>
        <Search />
        <div className='ml-auto flex items-center gap-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main fixed>
      <div className='mb-2 flex items-center justify-between space-y-2 flex-wrap gap-x-4'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Projects</h1>
          <p className='text-muted-foreground'>What will you create today?</p>
        </div>
        <div className='flex items-center gap-2'>
          <CreateProjectDialog/>
        </div>
      </div>
      <div className='my-4 flex items-end justify-between sm:my-0 sm:items-center'>
          <ProjectHeader
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
            allTags={allTags}
          />
          
          <ProjectToolbar
            sort={sortPreference}
            setSort={setSortPreference}
            displayPreferences={displayPreferences}
            setDisplayPreferences={setDisplayPreferences}
          />
        </div>

        <Separator className='shadow' />
        
        <ProjectList
          projects={filteredProjects}
          toggleStar={toggleStar}
          displayPreferences={displayPreferences}
        />
      </Main>
    </>
  )
}
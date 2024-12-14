import { useEffect, useMemo, useState } from 'react'
import { Separator } from '@/renderer/components/ui/separator'
import { Main } from '@/renderer/components/layout/main'
import { projects as dummyProjects } from '../../components/layout/data/projects-data'
import { ProjectHeader } from './components/project-header'
import { ProjectToolbar } from './components/project-toolbar'
import { useProjectsStore } from '@/renderer/stores/useProjectsStore'
import { useProjectFiltering } from '@/renderer/hooks/use-project-filtering'
import { ProjectList } from './components/project-list'
import { CreateProjectDialog } from './components/create-project-dialog'
import { AppHeader } from '@/renderer/components/layout/app-header'
import { PageHeader } from '@/renderer/components/layout/page-header'
import { IconPackages } from '@tabler/icons-react'

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
      <AppHeader />

      <Main fixed>
      <div className='mb-2 flex items-center justify-between space-y-2 flex-wrap gap-x-4'>
        <PageHeader
          title={"Projects"}
          description={"What will you create today?"}
          icon={IconPackages}
          />
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
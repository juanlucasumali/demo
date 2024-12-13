import { useEffect, useState } from 'react'
import { Separator } from '@/renderer/components/ui/separator'
import { Header } from '@/renderer/components/layout/header'
import { Main } from '@/renderer/components/layout/main'
import { ProfileDropdown } from '@/renderer/components/profile-dropdown'
import { Search } from '@/renderer/components/search'
import { ThemeSwitch } from '@/renderer/components/theme-switch'
import { projects as dummyProjects } from './data/projects'
import { ProjectHeader } from './components/project-header'
import { ProjectToolbar } from './components/project-toolbar'
import { ProjectCard } from './components/project-card'
import { useProjectsStore } from '@/renderer/stores/useProjectsStore'
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

  console.log('Projects from store:', projects) 
  console.log('Current display preferences:', displayPreferences)
  console.log('Current sort:', sortPreference)
  
  const [searchTerm, setSearchTerm] = useState('')

  const allTags = Array.from(
    new Set(projects.flatMap(project => project.tags.map(tag => tag.name)))
  ).sort()

  const getFilteredAndSortedProjects = () => {
    return projects
      // First filter
      .filter((project) => project.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter((project) => 
        selectedTags.length === 0 || 
        selectedTags.every(tag => project.tags.some(projectTag => projectTag.name === tag))
      )
      // Then sort
      .sort((a, b) => {
        // First priority: starred status
        if (a.isStarred && !b.isStarred) return -1;
        if (!a.isStarred && b.isStarred) return 1;
        
        // Second priority: selected sort preference
        const sortingStrategies = {
          ascending: () => a.name.localeCompare(b.name),
          descending: () => b.name.localeCompare(a.name),
          dateCreated: () => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime(),
          dateModified: () => new Date(b.dateModified).getTime() - new Date(a.dateModified).getTime(),
        }
        return sortingStrategies[sortPreference as keyof typeof sortingStrategies]?.() || 0
      });
  };

  const filteredProjects = getFilteredAndSortedProjects();

  useEffect(() => {
    console.log('Projects updated:', projects)
  }, [projects])

  // Add useEffect to initialize projects with dummy data
  useEffect(() => {
    const { setProjects } = useProjectsStore.getState()
    console.log('Setting initial projects:', dummyProjects)
    setProjects(dummyProjects)
  }, [])

  console.log('Filtered projects:', filteredProjects) // Debug filtered results

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
        
        <ul className='faded-bottom no-scrollbar grid gap-4 overflow-auto pb-16 pt-4 md:grid-cols-2 lg:grid-cols-3'>
        {filteredProjects.map((project) => (
          <ProjectCard
            key={project.name}
            project={project}
            toggleStar={toggleStar}
            displayPreferences={displayPreferences}
          />
        ))}
      </ul>
      </Main>
    </>
  )
}

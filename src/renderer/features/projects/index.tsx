import { useEffect, useMemo, useState } from 'react'
import { Separator } from '@/renderer/components/ui/separator'
import { Main } from '@/renderer/components/layout/main'
import { ProjectHeader } from './components/project-header'
import { ProjectToolbar } from './components/project-toolbar'
import { useProjectsStore } from '@/renderer/stores/useProjectsStore'
import { useProjectFiltering } from '@/renderer/hooks/use-project-filtering'
import { ProjectList } from './components/project-list'
import { CreateProjectDialog } from './components/create-project-dialog'
import { AppHeader } from '@/renderer/components/layout/app-header'
import { PageHeader } from '@/renderer/components/layout/page-header'
import { IconPackages } from '@tabler/icons-react'
import { Alert, AlertDescription } from '@/renderer/components/ui/alert' // From shadcn
import { Loader2 } from 'lucide-react'
import { supabase } from '@/renderer/lib/supabase'

export default function Projects() {
  const {
    projects,
    isLoading,
    error,
    fetchProjects,
    displayPreferences,
    sortPreference, 
    selectedTags,
    toggleStar,
    setDisplayPreferences,
    setSortPreference, 
    setSelectedTags,
  } = useProjectsStore()

  const [searchTerm, setSearchTerm] = useState('')

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  // Set up real-time subscription
  useEffect(() => {
    
    const channel = supabase
      .channel('projects-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects'
        },
        () => {
          // Refresh projects when any change occurs
          fetchProjects()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchProjects])

  const allTags = useMemo(() => 
    Array.from(
      new Set(projects.flatMap(project => 
        (project.tags as { name: string }[]).map(tag => tag.name)
      ))
    ).sort(),
    [projects]
  )

  const { getFilteredAndSortedProjects } = useProjectFiltering({
    projects,
    searchTerm,
    selectedTags,
    sortPreference
  })

  const filteredProjects = useMemo(() => {
    console.log('Recalculating filtered projects')
    console.log('Current selectedTags:', selectedTags)
    return getFilteredAndSortedProjects()
  }, [getFilteredAndSortedProjects, projects, searchTerm, selectedTags, sortPreference])

  return (
    <>
      <AppHeader />

      <Main fixed>
        <div className='mb-2 flex items-center justify-between space-y-2 flex-wrap gap-x-4'>
          <PageHeader
            title="Projects"
            description="What will you create today?"
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
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 size="lg" />
          </div>
        ) : error ? (
          <Alert variant="destructive" className="my-4">
            <AlertDescription>
              {error.message || 'Failed to load projects'}
            </AlertDescription>
          </Alert>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <IconPackages size={48} className="mb-4 opacity-50" />
            <p>No projects yet. Create your first project to get started!</p>
          </div>
        ) : (
          <ProjectList
            projects={filteredProjects}
            toggleStar={toggleStar}
            displayPreferences={displayPreferences}
          />
        )}
      </Main>
    </>
  )
}

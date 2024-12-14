import { useEffect, useState } from 'react'
import { useNavigationStore } from '@/renderer/stores/useNavigationStore'
import { useProjectsStore } from '@/renderer/stores/useProjectsStore'
import { Project } from '@/renderer/components/layout/types'
import { Main } from '@/renderer/components/layout/main'
import { Separator } from '@/renderer/components/ui/separator'
import { AppHeader } from '@/renderer/components/layout/app-header'
import { PageHeader } from '@/renderer/components/layout/page-header'

export default function ProjectDetail() {
  const { getCurrentPath } = useNavigationStore()
  const { projects } = useProjectsStore()
  const [project, setProject] = useState<Project | null>(null)

  useEffect(() => {
    const path = getCurrentPath()
    const projectId = path.split('/').pop()
    const foundProject = projects.find(p => p.id === projectId)
    setProject(foundProject || null)
  }, [getCurrentPath, projects])

  if (!project) {
    return <div>Project not found</div>
  }

  return (
    <>
      <AppHeader />
      <Main fixed>
        <div className='mb-2 flex items-center justify-between space-y-2 flex-wrap gap-x-4'>
          <PageHeader
            title={project.name}
            description={project.description}
            projectId={project.id}
          />
          <div className='flex items-center gap-2'>
            {/* <UploadFileDialog/> */}
            {/* <CreateFolderDialog/> */}
          </div>
        </div>
        
        <div className='my-4 flex items-end justify-between sm:my-0 sm:items-center'>
          {/* <ProjectDetailHeader
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
            allTags={allTags}
          /> */}
          
          {/* <ProjectDetailToolbar
            sort={sortPreference}
            setSort={setSortPreference}
            displayPreferences={displayPreferences}
            setDisplayPreferences={setDisplayPreferences}
          /> */}
        </div>

        <Separator className='shadow' />
        
        {/* <ProjectDetailTable
          projects={filteredProjects}
          toggleStar={toggleStar}
          displayPreferences={displayPreferences}
        /> */}
      </Main>
    </>
  )

  // Commented out return statement
  /*
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigation.goBack()}
            className="hover:bg-gray-100 p-2 rounded-full"
          >
            <IconArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold">{project.name}</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              // Handle edit
            }}
          >
            <IconEdit className="mr-2" size={16} />
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              // Handle share
            }}
          >
            <IconShare className="mr-2" size={16} />
            Share
          </Button>
        </div>
      </div>
    </div>
  )
  */
}

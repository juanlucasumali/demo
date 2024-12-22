import { PageHeader } from '@renderer/components/page/page-header'
import { FileQuestion, Package } from 'lucide-react'
import { PageContent } from '@renderer/components/page/page-content'
import { PageMain } from '@renderer/components/page/page-main'
import { ProjectList } from '@renderer/components/projects/project-list'
import { dummyProjects } from '@renderer/components/projects/dummy-projects'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/projects/')({
  component: Projects,
})

const displayPreferences = {
  tags: true,
  createdAt: false,
  lastModified: false,
}

export default function Projects() {
  function toggleStar(id: string, currentValue: boolean): Promise<void> {
    throw new Error('Function not implemented.')
  }

  return (
    <PageMain>
      <PageHeader
        title={'Projects'}
        description={'What will you create today?'}
        icon={Package}
      />

      <PageContent>
        <ProjectList
          projects={dummyProjects}
          toggleStar={toggleStar}
          displayPreferences={displayPreferences}
        />
      </PageContent>
    </PageMain>
  )
}

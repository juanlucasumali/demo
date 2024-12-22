import { DisplayPreferences, Project } from "@renderer/types/projects"
import { ProjectCard } from "./project-card"
import { useState } from 'react'
// import { EditProjectDialog } from "./edit-project-dialog"
// import { ShareProjectDialog } from "./share-project-dialog"

interface ProjectListProps {
    projects: Project[]
    toggleStar: (id: string, currentValue: boolean) => Promise<void>
    displayPreferences: DisplayPreferences
  }

export const ProjectList = ({ projects, toggleStar, displayPreferences }: ProjectListProps) => {
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [sharingProject, setSharingProject] = useState<Project | null>(null)

  return (
    <>
      <ul className='faded-bottom no-scrollbar grid gap-4 overflow-auto pb-16 pt-4 md:grid-cols-2 lg:grid-cols-3'>
        {projects.map((project) => (
          <ProjectCard
            key={project.name}
            project={project}
            toggleStar={toggleStar}
            displayPreferences={displayPreferences}
            onEditClick={setEditingProject}
            onSharingProject={setSharingProject}
          />
        ))}
      </ul>

      {/* <EditProjectDialog
        project={editingProject}
        isOpen={!!editingProject}
        onClose={() => setEditingProject(null)}
      />

      <ShareProjectDialog
        project={sharingProject}
        isOpen={!!sharingProject}
        onClose={() => setSharingProject(null)}
      /> */}
    </>
  )
}

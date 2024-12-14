import { DisplayPreferences } from "@/renderer/components/layout/types"
import { Project } from "../data/projects"
import { ProjectCard } from "./project-card"

interface ProjectListProps {
    projects: Project[]
    toggleStar: (id: string) => void
    displayPreferences: DisplayPreferences
  }
  
  export const ProjectList = ({ projects, toggleStar, displayPreferences }: ProjectListProps) => {
    return (
      <ul className='faded-bottom no-scrollbar grid gap-4 overflow-auto pb-16 pt-4 md:grid-cols-2 lg:grid-cols-3'>
        {projects.map((project) => (
          <ProjectCard
            key={project.name}
            project={project}
            toggleStar={toggleStar}
            displayPreferences={displayPreferences}
          />
        ))}
      </ul>
    )
  }
  
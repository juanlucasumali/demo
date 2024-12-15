import React from 'react'
import { ProjectItem } from '../data/schema'

// Update dialog types to match project item operations
export type ProjectDetailDialogType = 'rename' | 'delete' | 'move' | 'share' | 'upload' | 'create' | 'update'

interface ProjectDetailContextType {
  open: ProjectDetailDialogType | null
  setOpen: (type: ProjectDetailDialogType | null) => void
  currentRow: ProjectItem | null
  setCurrentRow: React.Dispatch<React.SetStateAction<ProjectItem | null>>
}

const ProjectDetailContext = React.createContext<ProjectDetailContextType | null>(null)

interface Props {
  children: React.ReactNode
  value: ProjectDetailContextType
}

export default function ProjectDetailContextProvider({ children, value }: Props) {
  return (
    <ProjectDetailContext.Provider value={value}>
      {children}
    </ProjectDetailContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useProjectDetailContext = () => {
  const projectDetailContext = React.useContext(ProjectDetailContext)

  if (!projectDetailContext) {
    throw new Error(
      'useProjectDetailContext has to be used within <ProjectDetailContext.Provider>'
    )
  }

  return projectDetailContext
}

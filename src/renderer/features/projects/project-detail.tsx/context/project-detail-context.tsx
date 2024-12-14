import { ProjectItem } from '@/renderer/components/layout/types'
import React from 'react'

export type ProjectDetailDialogType = 'create' | 'update' | 'delete' | 'upload' | 'createFolder'

interface ProjectDetailContextType {
  open: ProjectDetailDialogType | null
  setOpen: (str: ProjectDetailDialogType | null) => void
  currentItem: ProjectItem | null
  setCurrentItem: React.Dispatch<React.SetStateAction<ProjectItem | null>>
}

const ProjectDetailContext = React.createContext<ProjectDetailContextType | null>(null)

interface Props {
  children: React.ReactNode
  value: ProjectDetailContextType
}

export default function ProjectDetailContextProvider({ children, value }: Props) {
  return <ProjectDetailContext.Provider value={value}>{children}</ProjectDetailContext.Provider>
}

export const useProjectDetailContext = () => {
  const context = React.useContext(ProjectDetailContext)

  if (!context) {
    throw new Error(
      'useProjectDetailContext has to be used within <ProjectDetailContext.Provider>'
    )
  }

  return context
}

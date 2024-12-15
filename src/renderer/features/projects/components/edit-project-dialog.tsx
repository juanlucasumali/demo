// edit-project-dialog.tsx
import { Project } from "@/renderer/components/layout/types"
import { CreateProjectDialog } from "./create-project-dialog"

interface EditProjectDialogProps {
  project: Project | null
  onClose: () => void
  isOpen: boolean
}

export function EditProjectDialog({ project, onClose, isOpen }: EditProjectDialogProps) {
  if (!project) return null

  return (
    <CreateProjectDialog 
      mode="edit"
      project={project}
      trigger={null}
      isOpen={isOpen}
      onClose={onClose}
    />
  )
}

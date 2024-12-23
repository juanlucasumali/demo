import { columns } from '../../components/home/data-table/columns'
import { DataTable } from '../../components/home/data-table/data-table'
import { FilePlus, FolderPlus, HomeIcon, PackagePlus } from 'lucide-react'
import { useDataStore } from '@renderer/stores/items-store'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { GenericPage } from '@renderer/templates/generic-page'
import FileUpload from '@renderer/components/home/dialogs/file-upload'

export const Route = createFileRoute('/home/')({
  component: Home,
})

export default function Home() {
  const data = useDataStore((state) => state.data)
  const [upload, setUpload] = useState(false)
  const [createFolder, setCreateFolder] = useState(false)
  const [createProject, setCreateProject] = useState(false)

  const buttons = [
    { icon: FilePlus, tooltip: 'Upload a file', onClick: () => setUpload(true) },
    { icon: FolderPlus, tooltip: 'Create a folder', onClick: () => setCreateFolder(true) },
    { icon: PackagePlus, tooltip: 'Create a project', onClick: () => setCreateProject(true) },
  ]

  const dialogs = [
    { open: upload, setOpen: setUpload, content: <FileUpload setUpload={setUpload}/> },
    { open: createFolder, setOpen: setCreateFolder, content: <div>Create Folder Content</div> },
    { open: createProject, setOpen: setCreateProject, content: <div>Create Project Content</div> },
  ]

  return (
    <GenericPage
      title="Home"
      description="Supercharge creativity, simplify your media."
      icon={HomeIcon}
      buttons={buttons}
      dialogs={dialogs}
    >
      <DataTable columns={columns} data={data} />
    </GenericPage>
  )
}
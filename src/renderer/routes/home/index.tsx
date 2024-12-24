import { columns } from '../../components/home/data-table/columns'
import { DataTable } from '../../components/home/data-table/data-table'
import { FilePlus, FolderPlus, HomeIcon } from 'lucide-react'
import { useDataStore } from '@renderer/stores/items-store'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { GenericPage } from '@renderer/templates/generic-page'
import { UploadFile } from '@renderer/components/home/dialogs/upload-file'
import { CreateFolder } from '@renderer/components/home/dialogs/create-folder'

export const Route = createFileRoute('/home/')({
  component: Home,
})

export default function Home() {
  const data = useDataStore((state) => state.data)
  const [upload, setUpload] = useState(false)
  const [createFolder, setCreateFolder] = useState(false)

  const buttons = [
    { icon: FilePlus, tooltip: 'Upload a file', onClick: () => setUpload(true), title: "Upload File", },
    { icon: FolderPlus, tooltip: 'Create a folder', onClick: () => setCreateFolder(true), title: "Create Folder", },
  ]

  const dialogs = [
    { open: upload, setOpen: setUpload, content: <UploadFile setUpload={setUpload}/> },
    { open: createFolder, setOpen: setCreateFolder, content: <CreateFolder setCreateFolder={setCreateFolder}/> },
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
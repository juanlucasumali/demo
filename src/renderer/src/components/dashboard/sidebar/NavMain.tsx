import { FC } from 'react'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
} from "../../ui/sidebar"
import { SidebarItem } from './SidebarItem'

interface NavMainProps {
  onNavigate: (path: string, folderId: string | null) => void;
}

export const NavMain: FC<NavMainProps> = ({ onNavigate }) => {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Main</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarItem
          item={{
            id: 'root',
            name: 'My Files',
            type: 'folder',
            format: '',
            dateUploaded: '',
            size: 0,
            parentId: null
          }}
          onNavigate={onNavigate}
          isRoot
        />
      </SidebarMenu>
    </SidebarGroup>
  )
}

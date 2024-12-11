import { FC } from 'react'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
} from "../../ui/sidebar"
import { SidebarItem } from './SidebarItem'

export const NavMain: FC = () => {
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
          isRoot
        />
      </SidebarMenu>
    </SidebarGroup>
  )
}

import * as React from "react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar"
import { Send, User2 } from "lucide-react"

export function NavSecondary({
  ...props
}: {
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
            
            {/* <SidebarMenuItem key={'Contact Us'}>
              <SidebarMenuButton asChild size="sm" tooltip={'Contact Us'}>
                <a href={'/contact-us'}>
                  <Send />
                  <span>{'Contact Us'}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem key={'Profile'}>
              <SidebarMenuButton asChild size="sm" tooltip={'Profile'}>
                <a href={'/profile'}>
                  <User2 />
                  <span>{'Profile'}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem> */}

        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

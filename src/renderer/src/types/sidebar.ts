import { LucideIcon } from "lucide-react"

export interface NavItem {
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }

export interface Project {
  name: string
  url: string
  icon: LucideIcon
}
import { LucideIcon } from "lucide-react"
import { FileTreeItem } from "./files"

export interface NavSubItem {
  title: string;
  url: string;
}

export interface NavItem {
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
    viewType: string
    items?: (NavSubItem | FileTreeItem)[];
  }

export interface Project {
  name: string
  url: string
  icon: LucideIcon
}
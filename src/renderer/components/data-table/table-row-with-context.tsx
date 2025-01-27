import { Row } from "@tanstack/react-table"
import { DemoItem } from "@renderer/types/items"
import { AudioState } from "./data-table"
import { TableActions } from "./table-actions"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from "@renderer/components/ui/context-menu"
import { useEffect, useState } from "react"

interface TableRowWithContextProps {
  children: React.ReactNode
  row: Row<DemoItem>
  onEditFile?: (item: DemoItem) => void
  onShare?: (item: DemoItem) => void
  onDelete?: (item: DemoItem) => void
  setAudioState?: React.Dispatch<React.SetStateAction<AudioState>>
}

export function TableRowWithContext({
  children,
  row,
  onEditFile,
  onShare,
  onDelete,
  setAudioState
}: TableRowWithContextProps) {
  return (
    <ContextMenu modal={false}>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <TableActions
          row={row}
          menuType="context"
          onEditFile={onEditFile}
          onShare={onShare}
          onDelete={onDelete}
          setAudioState={setAudioState}
        />
      </ContextMenuContent>
    </ContextMenu>
  )
} 
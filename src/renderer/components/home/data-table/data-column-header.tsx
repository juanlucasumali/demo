import { Column } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff } from "lucide-react"

import { cn } from "../../../lib/utils"
import { Button } from "../../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu"

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  title: string
  disabled?: boolean
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
  disabled = false,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>
  }

  const handleSorting = (desc: boolean) => {
    // Custom sorting logic based on column title
    const columnId = column.id;

    if (columnId === "size") {
      // For size: toggle smallest to largest or largest to smallest
      column.toggleSorting(desc);
    } else if (columnId === "lastModified") {
      // For lastModified: toggle oldest to newest or newest to oldest
      column.toggleSorting(desc);
    } else {
      // Default behavior
      column.toggleSorting(desc);
    }
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
            disabled={disabled} // Disable button if sorting is false
          >
            <span>{title}</span>
            {!disabled && ( // Show icons only if sorting is enabled
              column.getIsSorted() === "desc" ? (
                <ArrowDown />
              ) : column.getIsSorted() === "asc" ? (
                <ArrowUp />
              ) : (
                <ChevronsUpDown />
              )
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => handleSorting(false)}>
            <ArrowUp className="h-3.5 w-3.5 text-muted-foreground/70" />
            {column.id === "size" ? "Smallest First" : "Oldest First"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSorting(true)}>
            <ArrowDown className="h-3.5 w-3.5 text-muted-foreground/70" />
            {column.id === "size" ? "Biggest First" : "Most Recent First"}
          </DropdownMenuItem>
          {/* <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
            <EyeOff className="h-3.5 w-3.5 text-muted-foreground/70" />
            Hide
          </DropdownMenuItem> */}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
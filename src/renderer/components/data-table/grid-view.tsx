import { Table } from "@tanstack/react-table"
import { cn } from "@renderer/lib/utils"
import { ItemType } from "@renderer/types/items"
import { Star, Folder, File } from "lucide-react"
import { Checkbox } from "@renderer/components/ui/checkbox"
import { AvatarGroup } from "@renderer/components/ui/avatar-group"
import TagBadge from "@renderer/components/tag-badge"
import { Link } from "@tanstack/react-router"
import { UserProfile } from "@renderer/types/users"
import folderImage from "@renderer/assets/macos-folder.png"
import { ProjectTag } from "@renderer/types/tags"

interface DataTableGridViewProps<TData> {
  table: Table<TData>
  enableSelection?: boolean
  enableRowLink?: boolean
  onRowClick?: (item: TData) => void
  onToggleStar?: (id: string, isStarred: boolean) => void
}

export function DataTableGridView<TData>({ 
  table,
  enableSelection,
  enableRowLink = true,
  onRowClick,
  onToggleStar
}: DataTableGridViewProps<TData>) {
  
  // Helper function to determine if row is clickable
  const isRowClickable = (original: any) => {
    return original.type === ItemType.FOLDER
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {table.getRowModel().rows.map((row) => {
        const isSelected = row.getIsSelected()
        const owner = row.getValue("owner") as UserProfile
        const sharedWith = row.getValue("sharedWith") as UserProfile[] | null
        const hasCollaborators = !row.getValue("icon") && sharedWith && sharedWith.length > 0
        const itemId = row.getValue("id") as string
        const isStarred = row.getValue("isStarred") as boolean
        const isClickable = isRowClickable(row.original)

        const content = (
          <div 
            className={cn(
              "group relative flex flex-col items-center p-4 rounded-lg border hover:shadow-md",
              "transition-all duration-200",
              "hover:bg-muted/50",
              "data-[state=selected]:bg-muted",
              isClickable && enableRowLink && "cursor-pointer hover:bg-muted/50",
              !isClickable && "cursor-default"
            )}
            data-state={isSelected ? "selected" : undefined}
            onClick={() => {
              if (isClickable && onRowClick) {
                onRowClick(row.original)
              }
            }}
          >
            {/* Star Button */}
            <div 
              className="absolute top-2 left-2"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (onToggleStar) {
                  onToggleStar(itemId, !isStarred)
                }
              }}
            >
              {isStarred ? (
                <Star className="h-4 w-4 text-yellow-500 fill-current cursor-pointer" />
              ) : (
                <Star className="h-4 w-4 text-gray-400 hover:text-gray-500 cursor-pointer" />
              )}
            </div>

            {/* Icon/Thumbnail with Collaborators */}
            <div className="relative">
              <div className="w-32 h-32 rounded-2xl mb-2 flex items-center justify-center text-4xl">
                {row.getValue("icon") ? (
                  <img src={row.getValue("icon")} alt="Icon" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <img 
                      src={folderImage} 
                      alt="Folder Icon" 
                      className="w-full h-full object-cover relative z-[2] pointer-events-none" 
                    />
                    {(owner || hasCollaborators) && (
                      <div className="absolute top-0 right-0 w-full h-full">
                        <AvatarGroup
                          owner={owner}
                          users={sharedWith || []}
                          size="sm"
                          variant="grid"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Title */}
            <h3 className="font-normal text-sm mb-1 text-center truncate max-w-[8rem]">
              {row.getValue("name")}
            </h3>

            {/* Bottom Row: Checkbox and Tag */}
            <div className="flex items-center justify-center w-full space-x-2">
              {enableSelection && (
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) => row.toggleSelected(!!checked)}
                  aria-label={`Select ${row.getValue("name")}`}
                  onClick={(e) => e.stopPropagation()}
                />
              )}
              
              {row.getValue("tags") as ProjectTag && (
                <div className="flex-shrink-0">
                  <TagBadge tag={row.getValue("tags")} />
                </div>
              )}
            </div>
          </div>
        )

        return (
          <div key={row.id}>
            {enableRowLink && isClickable ? (
              <Link 
                to={`/projects/${itemId}`}
                className="no-underline text-foreground"
              >
                {content}
              </Link>
            ) : (
              content
            )}
          </div>
        )
      })}
    </div>
  )
} 
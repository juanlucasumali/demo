import { Row } from "@tanstack/react-table"
import { Checkbox } from "@renderer/components/ui/checkbox"
import TagBadge from "@renderer/components/tag-badge"
import { FileTag } from "@renderer/types/tags"
import folderImage from "@renderer/assets/macos-folder.png"
import { Star } from "lucide-react"
import { UserProfile } from "@renderer/types/users"
import { cn } from "@renderer/lib/utils"
import { Link } from "@tanstack/react-router"
import { AvatarGroup } from "@renderer/components/ui/avatar-group"
import { ItemType } from "@renderer/types/items"
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from "@renderer/components/ui/context-menu"
import { TableActions } from "./table-actions"

interface GridItemProps<TData> {
  row: Row<TData>;
  isSelected: boolean;
  onSelectionChange: (checked: boolean) => void;
  enableSelection?: boolean;
  enableRowLink?: boolean;
  onLeave?: (item: TData) => void;
  onEditFile?: (item: TData) => void;
  onShare?: (item: TData) => void;
  onDelete?: (item: TData) => void;
  hideFileActions?: boolean;
}

export function GridItem<DemoItem>({ 
  row, 
  isSelected, 
  onSelectionChange, 
  enableSelection, 
  enableRowLink = true,
  onEditFile,
  onShare,
  onDelete,
  onLeave,
  hideFileActions = false
}: GridItemProps<DemoItem> & {
  onEditFile?: (item: any) => void;
  onShare?: (item: any) => void;
  onDelete?: (item: any) => void;
  onLeave?: (item: any) => void;
  hideFileActions?: boolean;
}) {
  const owner = row.getValue("owner") as UserProfile;
  const sharedWith = row.getValue("sharedWith") as UserProfile[] | null;
  const hasCollaborators = !row.getValue("icon") && sharedWith && sharedWith.length > 0;
  const itemId = row.getValue("id") as string;
  const isStarred = row.getValue("isStarred") as boolean;
  // const toggleIsStarred = useItemsStore((state) => state.toggleIsStarred);
  const isClickable = row.getValue("type") === ItemType.FOLDER


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
    >
      {/* Star Button - Absolute positioned */}
      <div 
        className="absolute top-2 left-2"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          // toggleIsStarred(itemId);
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
            onCheckedChange={onSelectionChange}
            aria-label={`Select ${row.getValue("name")}`}
          />
        )}
        
        {row.getValue("tags") as FileTag && (
          <div className="flex-shrink-0">
            <TagBadge tag={row.getValue("tags")} />
          </div>
        )}
      </div>
    </div>
  );

  const wrappedContent = (
    <ContextMenu modal={false}>
      <ContextMenuTrigger asChild>
        {enableRowLink ? (
          <Link 
            to={`/projects/${itemId}` as any}
            className="no-underline text-foreground"
          >
            {content}
          </Link>
        ) : content}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <TableActions
          row={row as any}
          menuType="context"
          onEditFile={onEditFile}
          onShare={onShare}
          onDelete={onDelete}
          onLeave={onLeave}
          hideFileActions={hideFileActions}
        />
      </ContextMenuContent>
    </ContextMenu>
  );

  return wrappedContent;
} 
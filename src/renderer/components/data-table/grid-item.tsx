import { Row } from "@tanstack/react-table"
import { Checkbox } from "@renderer/components/ui/checkbox"
import TagBadge from "@renderer/components/tag-badge"
import { FileTag } from "@renderer/types/tags"
import folderImage from "@renderer/assets/macos-folder.png";

interface GridItemProps<TData> {
  row: Row<TData>;
  isSelected: boolean
  onSelectionChange: (checked: boolean) => void
}

export function GridItem<DemoItem>({ 
  row, 
  isSelected, 
  onSelectionChange 
}: GridItemProps<DemoItem>) {

  console.log(row.original)
  console.log(row.getValue("tags"))

  return (
    <div 
      className="group relative flex flex-col items-center p-4 rounded-lg border hover:shadow-md transition-shadow"
      data-state={isSelected ? "selected" : undefined}
    >
      {/* Icon/Thumbnail */}
      <div 
        className="w-32 h-32 rounded-2xl mb-2 flex items-center justify-center text-4xl"
      >
        {row.getValue("icon") ? (
          <img src={row.getValue("icon")} alt="Icon" className="w-full h-full object-cover" />
        ) : (
          <img src={folderImage} alt="Folder Icon" className="w-full h-full object-cover" />
        )}
      </div>

      {/* Title */}
      <h3 className="font-normal text-sm mb-1 text-center truncate max-w-[8rem]">
        {row.getValue("name")}
      </h3>

      {/* Bottom Row: Checkbox and Tag */}
      <div className="flex items-center justify-center w-full space-x-2">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelectionChange}
          aria-label={`Select ${row.getValue("name")}`}
        />
        
        {row.getValue("tags") as FileTag && (
          <div className="flex-shrink-0">
            <TagBadge tag={row.getValue("tags")} />
          </div>
        )}
      </div>
    </div>
  )
} 
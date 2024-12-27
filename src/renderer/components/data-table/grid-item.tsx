import { Row } from "@tanstack/react-table"
import { Checkbox } from "@renderer/components/ui/checkbox"
import { generateGradientStyle } from "@renderer/lib/utils"
import { useMemo } from "react"
import TagBadge from "@renderer/components/tag-badge"
import { FileTag } from "@renderer/types/tags"

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
  const iconGradientStyle = useMemo(() => {
    return generateGradientStyle(row.id)
  }, [row.id])

  return (
    <div 
      className="group relative flex flex-col items-center p-4 rounded-lg border hover:shadow-md transition-shadow"
      data-state={isSelected ? "selected" : undefined}
    >
      {/* Icon/Thumbnail */}
      <div 
        className="w-32 h-32 rounded-2xl mb-4 flex items-center justify-center text-4xl"
        style={iconGradientStyle}
      >
        {row.getValue("icon")}
      </div>

      {/* Title */}
      <h3 className="font-medium text-lg mb-3 text-center line-clamp-1">
        {row.getValue("name")}
      </h3>

      {/* Bottom Row: Checkbox and Tag */}
      <div className="flex items-center justify-between w-full px-2">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelectionChange}
          aria-label={`Select ${row.getValue("name")}`}
        />
        
        {row.original.tags as FileTag && (
          <div className="flex-pshrink-0">
            <TagBadge tag={row.original.tags} />
          </div>
        )}
      </div>
    </div>
  )
} 
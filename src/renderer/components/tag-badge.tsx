import { FileTag, tagBgClasses } from "@renderer/types/items";
import { Badge } from "./ui/badge";
import { X } from "lucide-react";

interface TagBadgeProps {
  tag: FileTag;
  onRemove?: () => void;
}

export function TagBadge({ tag, onRemove }: TagBadgeProps) {
  if (!tag) return
  return (
    <Badge
      variant="secondary"
      className={`flex items-center gap-2 ${tagBgClasses.green}`}
    >
      {tag}
      {onRemove && <button
        className="flex items-center justify-center rounded-full"
        onClick={(e) => {
          e.stopPropagation(); // Prevent triggering parent events
          onRemove();
        }}
      >
        <X className="h-3 w-3 -ml-1" />
      </button>}
    </Badge>
  );
}

export default TagBadge;
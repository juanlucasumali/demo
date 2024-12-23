import { FileTagType, InstrumentType, StatusType, VersionType, fileTagColors } from "@renderer/types/tags";
import { Badge } from "./ui/badge";
import { X } from "lucide-react";

interface TagBadgeProps {
  tag: FileTagType | StatusType | InstrumentType | VersionType | null;
  property: string;
  onRemove?: () => void;
}

export function TagBadge({ tag, property, onRemove }: TagBadgeProps) {
  const hasRemove = onRemove !== undefined
  if (!tag) return
  return (
    <Badge
      variant="secondary"
      className={`flex items-center gap-2 ${fileTagColors[property]}`}
    >
      {tag}
      {hasRemove && <button
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
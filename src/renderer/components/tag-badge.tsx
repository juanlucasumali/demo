import { FileTagType, InstrumentType, StatusType, fileTagColors, VersionType } from "@renderer/types/tags";
import { Badge } from "./ui/badge";

interface TagBadgeProps {
  tag: FileTagType | StatusType | InstrumentType | VersionType
  property: string
}

export function TagBadge({ tag, property }: TagBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={`${fileTagColors[property]}`}
    >
      {tag}
    </Badge>
  );
};

export default TagBadge;
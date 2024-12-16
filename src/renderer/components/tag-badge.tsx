import { FILE_TAGS, FileTags } from "./layout/types";
import { Badge } from "./ui/badge";

type TagOption = typeof FILE_TAGS[FileTags]["options"][number]

const getTagCategory = (tag: string): { category: FileTags; color: string } | null => {
  for (const [category, config] of Object.entries(FILE_TAGS)) {
    if ((config.options as readonly string[]).includes(tag)) {
      return { 
        category: category as FileTags, 
        color: config.color 
      }
    }
  }
  return null
}
  
export const TagBadge = ({ tag }: { tag: string }) => {
  const tagInfo = getTagCategory(tag)
  if (!tagInfo) return (
    <Badge variant="secondary" className="whitespace-nowrap">
      {tag}
    </Badge>
  )

  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    green: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    red: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    pink: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
    sky: 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300',
    orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  }

  return (
    <Badge
      variant="secondary"
      className={`whitespace-nowrap px-2 py-0.5 ${colorClasses[tagInfo.color]}`}
    >
      {tag}
    </Badge>
  )
}
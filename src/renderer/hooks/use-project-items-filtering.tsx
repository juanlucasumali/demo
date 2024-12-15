import { ProjectItem } from "../components/layout/types"

interface UseProjectItemFilteringProps {
  items: ProjectItem[]
  searchTerm: string
  selectedTags: string[]
  sortPreference: string
}

export function useProjectItemFiltering({
  items,
  searchTerm,
  selectedTags,
  sortPreference,
}: UseProjectItemFilteringProps) {
  const getFilteredAndSortedItems = () => {
    let filtered = [...items]

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(item => 
        item.name?.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower)
      )
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(item =>
        item.tags?.some(tag => selectedTags.includes(tag))
      )
    }

    // Sort function for each preference
    const sortFunctions = {
      ascending: (a: ProjectItem, b: ProjectItem) => 
        (a.name || '').localeCompare(b.name || ''),
      descending: (a: ProjectItem, b: ProjectItem) => 
        (b.name || '').localeCompare(a.name || ''),
      size: (a: ProjectItem, b: ProjectItem) => 
        (b.size || 0) - (a.size || 0),
      createdAt: (a: ProjectItem, b: ProjectItem) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
      lastModified: (a: ProjectItem, b: ProjectItem) => 
        new Date(b.lastModified || 0).getTime() - new Date(a.lastModified || 0).getTime(),
    }

    // First, separate starred and non-starred items
    const starredItems = filtered.filter(item => item.isStarred)
    const nonStarredItems = filtered.filter(item => !item.isStarred)

    // Sort each group separately
    const sortFn = sortFunctions[sortPreference as keyof typeof sortFunctions] || sortFunctions.lastModified
    starredItems.sort(sortFn)
    nonStarredItems.sort(sortFn)

    // Combine the groups back together
    return [...starredItems, ...nonStarredItems]
  }

  return { getFilteredAndSortedItems }
}

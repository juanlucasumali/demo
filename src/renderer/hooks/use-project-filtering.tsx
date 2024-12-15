import { Project } from "../components/layout/types"


interface UseProjectFilteringProps {
  projects: Project[]
  searchTerm: string
  selectedTags: string[]
  sortPreference: string
}

export function useProjectFiltering({
  projects,
  searchTerm,
  selectedTags,
  sortPreference,
}: UseProjectFilteringProps) {
  const getFilteredAndSortedProjects = () => {
    let filtered = [...projects]

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(project => 
        project.name?.toLowerCase().includes(searchLower) ||
        project.description?.toLowerCase().includes(searchLower)
      )
    }

    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(project => {
        const projectTags = project.tags.map(tag => tag.name)
        
        const matches = selectedTags.every(selectedTag => {
          // Split the tag into category and value
          const [category, value] = selectedTag.split(':')
          
          // Check if the project has this tag
          const hasTag = projectTags.includes(value)
          return hasTag
        })
        
        return matches
      })
    }

    // Sort function for each preference
    const sortFunctions = {
      ascending: (a: Project, b: Project) => (a.name || '').localeCompare(b.name || ''),
      descending: (a: Project, b: Project) => (b.name || '').localeCompare(a.name || ''),
      dateCreated: (a: Project, b: Project) => 
        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime(),
      lastModified: (a: Project, b: Project) => 
        new Date(b.last_modified || 0).getTime() - new Date(a.last_modified || 0).getTime(),
    }

    // First, separate starred and non-starred projects
    const starredProjects = filtered.filter(project => project.is_starred)
    const nonStarredProjects = filtered.filter(project => !project.is_starred)

    // Sort each group separately
    const sortFn = sortFunctions[sortPreference as keyof typeof sortFunctions] || sortFunctions.lastModified
    starredProjects.sort(sortFn)
    nonStarredProjects.sort(sortFn)

    // Combine the groups back together
    return [...starredProjects, ...nonStarredProjects]
  }

  return { getFilteredAndSortedProjects }
}

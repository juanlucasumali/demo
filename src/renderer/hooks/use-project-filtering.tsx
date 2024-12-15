import { Project } from "../components/layout/types"

interface UseProjectFilteringProps {
  projects: Project[]
  searchTerm: string
  selectedTags: string[]
  sortPreference: string
}

export const useProjectFiltering = ({
  projects,
  searchTerm,
  selectedTags,
  sortPreference
}: UseProjectFilteringProps) => {
  const getTagCategory = (tagWithCategory: string) => {
    const [category, tag] = tagWithCategory.split(':')
    return { category, tag }
  }

  const filterProjects = (projects: Project[]) => {
    return projects
      .filter((project) => project.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter((project) => 
        selectedTags.length === 0 || 
        selectedTags.every(tagWithCategory => {
          const { category, tag } = getTagCategory(tagWithCategory)
          return project.tags.some(
            projectTag => 
              projectTag.category === category && 
              projectTag.name === tag
          )
        })
      )
  }

  const sortProjects = (filteredProjects: Project[]) => {
    return filteredProjects.sort((a, b) => {
      if (a.isStarred && !b.isStarred) return -1
      if (!a.isStarred && b.isStarred) return 1
      
      const sortingStrategies = {
        ascending: () => a.name.localeCompare(b.name),
        descending: () => b.name.localeCompare(a.name),
        dateCreated: () => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime(),
        lastModified: () => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime(),
      }
      return sortingStrategies[sortPreference as keyof typeof sortingStrategies]?.() || 0
    })
  }

  const getFilteredAndSortedProjects = () => {
    const filtered = filterProjects(projects)
    return sortProjects(filtered)
  }

  return { getFilteredAndSortedProjects }
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as itemsService from '@renderer/services/items-service'

export function useItems(parentFolderId?: string) {
  const queryClient = useQueryClient()
  const queryKey = ['files-and-folders', parentFolderId];

  const { data: filesAndFolders = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => itemsService.getFilesAndFolders(parentFolderId),
  });

  // Query for projects
  const { data: projects = [], isLoading: isLoadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: itemsService.getProjects
  })

  // Compute starred items
  const starredItems = [...filesAndFolders, ...projects].filter(item => item.isStarred)

  // Add file or folder mutation
  const addFileOrFolder = useMutation({
    mutationFn: itemsService.addFileOrFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] })
    }
  })

  // Add project mutation
  const addProject = useMutation({
    mutationFn: itemsService.addProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    }
  })

  // Remove item mutation
  const removeItem = useMutation({
    mutationFn: itemsService.removeItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    }
  })

  // Update item mutation
  const updateItem = useMutation({
    mutationFn: itemsService.updateItem,
    onSuccess: (_, variables) => {
      const queryKey = variables.type === 'project' ? ['projects'] : ['files']
      queryClient.invalidateQueries({ queryKey })
    }
  })

  // Toggle star mutation
  const toggleStar = useMutation({
    mutationFn: ({ id, isStarred }: { id: string; isStarred: boolean }) => 
      itemsService.toggleItemStar(id, isStarred),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    }
  })

  return {
    filesAndFolders,
    projects,
    starredItems,
    addFileOrFolder: addFileOrFolder.mutate,
    addProject: addProject.mutate,
    removeItem: removeItem.mutate,
    updateItem: updateItem.mutate,
    toggleStar: toggleStar.mutate,
    isLoading: {
      addFileOrFolder: addFileOrFolder.isPending,
      addProject: addProject.isPending,
      removeItem: removeItem.isPending,
      updateItem: updateItem.isPending,
      toggleStar: toggleStar.isPending,
      filesAndFolders: isLoading,
      projects: isLoadingProjects
    }
  }
} 
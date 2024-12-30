import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as itemsService from '@renderer/services/items-service'

interface UseItemsOptions {
  parentFolderId?: string;
  projectId?: string;
}

export function useItems(options?: UseItemsOptions) {
  const queryClient = useQueryClient()
  const queryKey = ['files-and-folders', options?.parentFolderId, options?.projectId];

  const { data: filesAndFolders = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => itemsService.getFilesAndFolders(options?.parentFolderId, options?.projectId),
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
      // Invalidate both root-level and folder-specific queries
      queryClient.invalidateQueries({ 
        queryKey: ['files-and-folders']
      })
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
      queryClient.invalidateQueries({ queryKey: ['files-and-folders'] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    }
  })

  // Update item mutation
  const updateItem = useMutation({
    mutationFn: itemsService.updateItem,
    onSuccess: (_, variables) => {
      const baseQueryKey = variables.type === 'project' ? ['projects'] : ['files-and-folders']
      queryClient.invalidateQueries({ 
        queryKey: baseQueryKey 
      })
      // Also invalidate the specific project query if we're in a project context
      if (options?.projectId) {
        queryClient.invalidateQueries({ 
          queryKey: ['files-and-folders', null, options.projectId]
        })
      }
    }
  })

  // Toggle star mutation
  const toggleStar = useMutation({
    mutationFn: ({ id, isStarred }: { id: string; isStarred: boolean }) => 
      itemsService.toggleItemStar(id, isStarred),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files-and-folders'] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    }
  })

  // Add query for current folder if parentFolderId is provided
  const { data: currentFolder, isLoading: isLoadingCurrentFolder } = useQuery({
    queryKey: ['folder', options?.parentFolderId],
    queryFn: () => options?.parentFolderId ? itemsService.getFolder(options?.parentFolderId) : null,
    enabled: !!options?.parentFolderId
  });

  // Add query for current project if projectId is provided
  const { data: currentProject, isLoading: isLoadingCurrentProject } = useQuery({
    queryKey: ['project', options?.projectId],
    queryFn: () => options?.projectId ? itemsService.getProject(options?.projectId) : null,
    enabled: !!options?.projectId
  });

  return {
    filesAndFolders,
    projects,
    starredItems,
    currentFolder,
    currentProject,
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
      projects: isLoadingProjects,
      currentFolder: isLoadingCurrentFolder,
      currentProject: isLoadingCurrentProject
    }
  }
} 
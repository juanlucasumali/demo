import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as itemsService from '@renderer/services/items-service'
import { DemoItem } from '@renderer/types/items';
import { UserProfile } from '@renderer/types/users';

interface UseItemsOptions {
  parentFolderId?: string;
  projectId?: string;
  collectionId?: string;
  searchTerm?: string;
}

export function useItems(options?: UseItemsOptions) {
  const queryClient = useQueryClient()
  const queryKey = ['files-and-folders', options?.parentFolderId, options?.projectId];

  const { data: filesAndFolders = [], isLoading } = useQuery({
    queryKey: ['files-and-folders', options?.parentFolderId, options?.projectId, options?.collectionId],
    queryFn: () => itemsService.getFilesAndFolders(
      options?.parentFolderId, 
      options?.projectId,
      options?.collectionId
    ),
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
    mutationFn: ({ item, sharedWith }: { 
      item: Omit<DemoItem, 'id'>, 
      sharedWith?: UserProfile[] 
    }) => itemsService.addFileOrFolder(item, sharedWith),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files-and-folders'] })
    }
  })

  // Add project mutation
  const addProject = useMutation({
    mutationFn: ({ item, sharedWith }: { 
      item: Omit<DemoItem, 'id'>, 
      sharedWith?: UserProfile[] 
    }) => itemsService.addProject(item, sharedWith),
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
    mutationFn: ({ updatedItem, originalItem }: { 
      updatedItem: DemoItem, 
      originalItem: DemoItem 
    }) => itemsService.updateItem(updatedItem, originalItem),
    onSuccess: (_, variables) => {
      const baseQueryKey = variables.updatedItem.type === 'project' ? ['projects'] : ['files-and-folders']
      queryClient.invalidateQueries({ 
        queryKey: baseQueryKey 
      })
      // Also invalidate the specific project query
      if (variables.updatedItem.type === 'project') {
        queryClient.invalidateQueries({ 
          queryKey: ['project', variables.updatedItem.id]
        })
      }
      // Invalidate project files if in project context
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

  // Add this inside useItems function
  const addCollection = useMutation({
    mutationFn: ({ projectId, name }: { projectId: string; name: string }) => 
      itemsService.createCollection(projectId, name),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: ['collections'] 
      });
      // If we're in a project context, invalidate that project's data
      if (options?.projectId) {
        queryClient.invalidateQueries({ 
          queryKey: ['files-and-folders', null, options.projectId]
        });
      }
    }
  });

  // Add this inside useItems function
  const shareItemsMutation = useMutation({
    mutationFn: ({ items, users }: { items: DemoItem[], users: UserProfile[] }) =>
      itemsService.shareItems(items, users),
    onSuccess: () => {
      // Invalidate queries that might be affected by sharing
      queryClient.invalidateQueries({ queryKey: ['files-and-folders'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });

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

  // Add query for collections if projectId is provided
  const { data: collections = [], isLoading: isLoadingCollections } = useQuery({
    queryKey: ['collections', options?.projectId],
    queryFn: () => itemsService.getCollections(options?.projectId),
    enabled: !!options?.projectId
  });

  // Add current collection query
  const { data: currentCollection, isLoading: isLoadingCurrentCollection } = useQuery({
    queryKey: ['collection', options?.collectionId],
    queryFn: () => options?.collectionId ? itemsService.getCollection(options.collectionId) : null,
    enabled: !!options?.collectionId
  });

  const removeCollection = useMutation({
    mutationFn: (collectionId: string) => itemsService.removeCollection(collectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['collections'] 
      });
      if (options?.projectId) {
        queryClient.invalidateQueries({ 
          queryKey: ['files-and-folders', null, options.projectId]
        });
      }
    }
  });

  const searchFriendsQuery = useQuery({
    queryKey: ['friends', options?.searchTerm],
    queryFn: () => itemsService.searchFriends(options?.searchTerm),
    enabled: true,
  });

  return {
    filesAndFolders,
    projects,
    starredItems,
    currentFolder,
    currentProject,
    collections,
    addFileOrFolder: addFileOrFolder.mutate,
    addProject: addProject.mutate,
    removeItem: removeItem.mutate,
    updateItem: updateItem.mutate,
    toggleStar: toggleStar.mutate,
    addCollection: addCollection.mutate,
    shareItems: shareItemsMutation.mutate,
    currentCollection,
    removeCollection,
    friends: searchFriendsQuery.data || [],
    isLoading: {
      addFileOrFolder: addFileOrFolder.isPending,
      addProject: addProject.isPending,
      removeItem: removeItem.isPending,
      updateItem: updateItem.isPending,
      toggleStar: toggleStar.isPending,
      filesAndFolders: isLoading,
      projects: isLoadingProjects,
      currentFolder: isLoadingCurrentFolder,
      currentProject: isLoadingCurrentProject,
      addCollection: addCollection.isPending,
      shareItems: shareItemsMutation.isPending,
      collections: isLoadingCollections,
      currentCollection: isLoadingCurrentCollection,
      removeCollection: removeCollection.isPending,
      friends: searchFriendsQuery.isLoading
    }
  }
} 
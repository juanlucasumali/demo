import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as itemsService from '@renderer/services/items-service'
import { DemoItem, ItemType } from '@renderer/types/items';
import { UserProfile } from '@renderer/types/users';
import { getCurrentUserId } from '@renderer/services/items-service';

interface UseItemsOptions {
  parentFolderId?: string;
  projectId?: string;
  collectionId?: string;
  searchTerm?: string;
}

export function useItems(options?: UseItemsOptions) {
  const queryClient = useQueryClient()
  const queryKey = ['files-and-folders', options?.parentFolderId, options?.projectId, options?.searchTerm];

  const { data: filesAndFolders = [], isLoading } = useQuery({
    queryKey: ['files-and-folders', options?.parentFolderId, options?.projectId, options?.collectionId, options?.searchTerm],
    queryFn: () => itemsService.getFilesAndFolders(
      options?.parentFolderId, 
      options?.projectId,
      options?.collectionId,
      options?.searchTerm
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
    mutationFn: async ({ 
      item, 
      sharedWith, 
      fileContent 
    }: { 
      item: Omit<DemoItem, 'id'>, 
      sharedWith?: UserProfile[],
      fileContent?: ArrayBuffer
    }) => {
      // Wait for the entire operation to complete
      const result = await itemsService.addFileOrFolder(item, sharedWith, fileContent);
      
      // Invalidate queries after successful completion
      await queryClient.invalidateQueries({ 
        queryKey: ['files-and-folders'] 
      });
      
      return result;
    },
  });

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
  const deleteItem = useMutation({
    mutationFn: itemsService.deleteItem,
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
    mutationFn: ({ id, isStarred, type }: { id: string; isStarred: boolean; type: ItemType }) => 
      itemsService.toggleItemStar(id, isStarred, type),
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

  const bulkDeleteMutation = useMutation({
    mutationFn: async (itemIds: string[]) => {
      for (const id of itemIds) {
        await itemsService.deleteItem(id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files-and-folders'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });

  // Add this mutation inside useItems
  const addToProjectMutation = useMutation({
    mutationFn: ({ items, projectId }: { items: DemoItem[], projectId: string }) =>
      itemsService.addToProject(items, projectId),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['files-and-folders'] });
      if (options?.projectId) {
        queryClient.invalidateQueries({ 
          queryKey: ['files-and-folders', null, options.projectId]
        });
      }
    }
  });

  const addToCollectionMutation = useMutation({
    mutationFn: ({ items, collectionId, projectId }: { 
      items: DemoItem[], 
      collectionId: string,
      projectId: string 
    }) => itemsService.addToCollection(items, collectionId, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files-and-folders'] });
      if (options?.collectionId) {
        queryClient.invalidateQueries({ 
          queryKey: ['files-and-folders', null, options.projectId, options.collectionId]
        });
      }
    }
  });

  // Add project count query
  const { data: projectCount = 0, isLoading: isLoadingProjectCount } = useQuery({
    queryKey: ['project-count'],
    queryFn: () => itemsService.getProjectCount(getCurrentUserId()),
  });

  return {
    filesAndFolders,
    projects,
    starredItems,
    currentFolder,
    currentProject,
    collections,
    projectCount,
    addFileOrFolder: addFileOrFolder.mutate,
    addProject: addProject.mutate,
    deleteItem: deleteItem.mutate,
    updateItem: updateItem.mutate,
    toggleStar: toggleStar.mutate,
    addCollection: addCollection.mutate,
    currentCollection,
    removeCollection,
    friends: searchFriendsQuery.data || [],
    bulkDelete: bulkDeleteMutation.mutate,
    addToProject: addToProjectMutation.mutate,
    addToCollection: addToCollectionMutation.mutate,
    isLoading: {
      addFileOrFolder: addFileOrFolder.isPending,
      addProject: addProject.isPending,
      deleteItem: deleteItem.isPending,
      updateItem: updateItem.isPending,
      toggleStar: toggleStar.isPending,
      filesAndFolders: isLoading,
      projects: isLoadingProjects,
      currentFolder: isLoadingCurrentFolder,
      currentProject: isLoadingCurrentProject,
      addCollection: addCollection.isPending,
      collections: isLoadingCollections,
      currentCollection: isLoadingCurrentCollection,
      removeCollection: removeCollection.isPending,
      friends: searchFriendsQuery.isLoading,
      bulkDelete: bulkDeleteMutation.isPending,
      addToProject: addToProjectMutation.isPending,
      addToCollection: addToCollectionMutation.isPending,
      projectCount: isLoadingProjectCount,
    }
  }
} 
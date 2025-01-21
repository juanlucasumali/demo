import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as userService from '@renderer/services/user-service'
import { UserProfile } from '@renderer/types/users'
import { DemoItem } from '@renderer/types/items'

interface UseUsersOptions {
  userId?: string
}

export function useUsers(options?: UseUsersOptions) {
  const queryClient = useQueryClient()

  // Query for user profile
  const { data: profile, isLoading: isLoadingProfile } = useQuery<UserProfile | null>({
    queryKey: ['profile', options?.userId],
    queryFn: () => options?.userId ? userService.getProfile(options.userId) : null,
    enabled: !!options?.userId
  })

  // Query for user highlights
  const { data: highlights = [], isLoading: isLoadingHighlights } = useQuery({
    queryKey: ['highlights', options?.userId],
    queryFn: () => options?.userId ? userService.getHighlights(options.userId) : [],
    enabled: !!options?.userId
  })

  // Query for user favorites
  const { data: favorites = { movie: null, song: null, place: null }, isLoading: isLoadingFavorites } = useQuery({
    queryKey: ['favorites', options?.userId],
    queryFn: () => options?.userId ? userService.getFavorites(options.userId) : null,
    enabled: !!options?.userId
  })

  // Create profile mutation
  const createProfile = useMutation({
    mutationFn: async ({ 
      data, 
      avatarInfo 
    }: { 
      data: UserProfile; 
      avatarInfo?: { b2FileId: string; fileName: string } 
    }) => {
      await userService.createProfile(data, avatarInfo)
      return userService.getProfile(data.id)
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['profile', data.id], data)
    }
  })

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: (profile: UserProfile) => userService.updateProfile(profile),
    onSuccess: (_, variables) => {
      queryClient.setQueryData(['profile', variables.id], variables)
    }
  })

  // Upload avatar mutation
  const uploadAvatar = useMutation({
    mutationFn: ({ userId, file }: { userId: string; file: File }) => 
      userService.uploadAvatar(userId, file)
  })

  // Update highlights mutation
  const updateHighlights = useMutation({
    mutationFn: ({ userId, items }: { userId: string; items: DemoItem[] }) =>
      userService.updateHighlights(userId, items),
    onSuccess: (_, variables) => {
      queryClient.setQueryData(['highlights', variables.userId], variables.items)
    }
  })

  // Update favorites mutation
  const updateFavorites = useMutation({
    mutationFn: ({ 
      userId, 
      data 
    }: { 
      userId: string; 
      data: { movie: string | null; song: string | null; place: string | null } 
    }) => userService.updateFavorites(userId, data),
    onSuccess: (_, variables) => {
      queryClient.setQueryData(['favorites', variables.userId], variables.data)
    }
  })

  return {
    // Data
    profile,
    highlights,
    favorites,

    // Mutations
    createProfile: createProfile.mutate,
    updateProfile: updateProfile.mutate,
    uploadAvatar: uploadAvatar.mutate,
    updateHighlights: updateHighlights.mutate,
    updateFavorites: updateFavorites.mutate,

    // Loading states
    isLoading: {
      profile: isLoadingProfile,
      highlights: isLoadingHighlights,
      favorites: isLoadingFavorites,
      createProfile: createProfile.isPending,
      updateProfile: updateProfile.isPending,
      uploadAvatar: uploadAvatar.isPending,
      updateHighlights: updateHighlights.isPending,
      updateFavorites: updateFavorites.isPending
    }
  }
} 
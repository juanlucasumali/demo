import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as shareService from '@renderer/services/share-service'
import { DemoItem } from '@renderer/types/items'
import { UserProfile } from '@renderer/types/users'

export function useShare() {
  const queryClient = useQueryClient()

  const shareItems = useMutation({
    mutationFn: ({ items, users }: { items: DemoItem[], users: UserProfile[] }) =>
      shareService.shareItems(items, users),
    onSuccess: () => {
      // Invalidate queries that might be affected by sharing
      queryClient.invalidateQueries({ queryKey: ['files-and-folders'] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    }
  })

  const unshareItems = useMutation({
    mutationFn: ({ items, users }: { items: DemoItem[], users: UserProfile[] }) =>
      shareService.unshareItems(items, users),
    onSuccess: () => {
      // Invalidate queries that might be affected by unsharing
      queryClient.invalidateQueries({ queryKey: ['files-and-folders'] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    }
  })

  return {
    shareItems: shareItems.mutate,
    unshareItems: unshareItems.mutate,
    isSharing: shareItems.isPending,
    isUnsharing: unshareItems.isPending
  }
} 
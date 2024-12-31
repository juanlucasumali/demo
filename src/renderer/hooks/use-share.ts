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

  return {
    shareItems: shareItems.mutate,
    isSharing: shareItems.isPending
  }
} 
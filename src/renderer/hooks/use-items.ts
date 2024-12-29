import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { DemoItem, ItemType } from '@renderer/types/items'

export function useItems() {
  const queryClient = useQueryClient()

  const { data: filesAndFolders } = useQuery({
    queryKey: ['files'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('files')
        .select('*')
      if (error) throw error
      return data as DemoItem[]
    }
  })

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
      if (error) throw error
      return data as DemoItem[]
    }
  })

  const addItem = useMutation({
    mutationFn: async (item: DemoItem) => {
      const { error } = await supabase
        .from(item.type === ItemType.PROJECT ? 'projects' : 'files')
        .insert(item)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    }
  })

  return {
    filesAndFolders,
    projects,
    addItem
  }
} 
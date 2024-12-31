import { Play, Plus, MoreHorizontal, Trash2 } from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import { SubHeader } from '@renderer/components/page-layout/sub-header'
import { useItems } from '@renderer/hooks/use-items'
import { Link, useRouterState } from '@tanstack/react-router'
import { useState } from 'react'
import { DeleteDialog } from '../dialogs/delete-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'

interface CollectionsSidebarProps {
  projectId: string
  onCreateCollection: () => void
}

export function CollectionsSidebar({ projectId, onCreateCollection }: CollectionsSidebarProps) {
  const { collections, isLoading, removeCollection } = useItems({ projectId })
  const routerState = useRouterState()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null)

  if (isLoading.collections) {
    return (
      <div className="w-48 flex-shrink-0">
        <div className="sticky top-0">
          <SubHeader subHeader="Collections" />
          <div className="animate-pulse space-y-2 mt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 bg-muted rounded-md" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-48 flex-shrink-0">
      <div className="sticky top-0">
        <div>
          <SubHeader subHeader="Collections"/>
        </div>
        <nav className="space-y-1">
          <Link
            to={`/projects/${projectId}`}
            className={cn(
              'flex items-center gap-2 px-3 py-2 text-sm',
              'rounded-md hover:bg-muted',
              'text-muted-foreground hover:text-foreground',
              'transition-colors',
              {
                'bg-muted text-foreground': routerState.location.pathname.endsWith(`/projects/${projectId}`)
              }
            )}
          >
            <Play className="h-4 w-4" />
            All
          </Link>

          {collections?.map((collection) => {
            const isActive = routerState.location.pathname.startsWith(`/projects/${projectId}/${collection.id}`)

            return (
              <div
                key={collection.id}
                className="flex items-center justify-between group"
              >
                <Link
                  to={`/projects/${projectId}/${collection.id}`}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 text-sm grow',
                    'rounded-md hover:bg-muted',
                    'text-muted-foreground hover:text-foreground',
                    'transition-colors',
                    {
                      'bg-muted text-foreground': isActive
                    }
                  )}
                >
                  <Play className="h-4 w-4" />
                  {collection.name}
                </Link>
                
                <DropdownMenu>
                  <DropdownMenuTrigger className="opacity-0 group-hover:opacity-100 p-2">
                    <MoreHorizontal className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={() => {
                        setSelectedCollectionId(collection.id ?? null)
                        setDeleteDialogOpen(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )
          })}

          <button
            onClick={onCreateCollection}
            className={cn(
              'flex w-full items-center gap-2 px-3 py-2 text-sm',
              'rounded-md hover:bg-muted',
              'text-muted-foreground hover:text-foreground',
              'transition-colors',
              'cursor-pointer',
            )}
          >
            <Plus className="h-4 w-4" />
            New Collection
          </button>
        </nav>

        {/* Delete Dialog */}
        {selectedCollectionId && (
          <DeleteDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            itemId={selectedCollectionId}
            handleDialogClose={() => setSelectedCollectionId(null)}
            removeItem={removeCollection.mutate}
            isLoading={removeCollection.isPending}
          />
        )}
      </div>
    </div>
  )
} 
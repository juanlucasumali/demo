"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  OnChangeFn,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  Row,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@renderer/components/ui/table"
import { Input } from "@renderer/components/ui/input"
import { DataTablePagination } from "./data-table-pagination"
import { cn, isAudioFile } from "@renderer/lib/utils"
import { Skeleton } from "@renderer/components/ui/skeleton"
import { Loader2 } from "lucide-react"
import { ItemType } from '@renderer/types/items'
import { DataTableGridView } from "./grid-view"
import { useMediaPlayerStore } from "@renderer/stores/use-media-player-store"


interface DataTableProps<DemoItem> {
  columns: ColumnDef<DemoItem>[]
  data: DemoItem[]
  enableSelection?: boolean
  enableActions?: boolean
  enableSharedWith?: boolean
  viewMode?: 'table' | 'grid'
  pageSize?: number
  onSelectionChange?: (items: DemoItem[]) => void
  initialSelectedItems?: DemoItem[]
  enableRowLink?: boolean
  showColumnHeaders?: boolean
  showPagination?: boolean
  showSearch?: boolean
  onRowClick?: (item: DemoItem) => void
  isLoading?: boolean
  onToggleStar?: (id: string, isStarred: boolean) => void
}

type AudioState = {
  hoveredRow: string | null;
  playingRow: string | null;
  loadingRow: string | null;
  currentRow: string | null;
}

export function DataTable<DemoItem>({
  columns,
  data,
  enableSelection = false,
  enableActions = true,
  enableSharedWith = true,
  viewMode = 'table',
  pageSize = 10,
  onSelectionChange,
  initialSelectedItems = [],
  enableRowLink,
  showColumnHeaders = true,
  showPagination = true,
  showSearch = true,
  onRowClick,
  isLoading = false,
  onToggleStar,
}: DataTableProps<DemoItem>) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'isStarred', desc: true }, // true first
    { id: 'lastModified', desc: true }, // true first
  ]);
  
  // Handle sorting changes while ensuring isStarred remains the primary sort
  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    setSorting((oldSorting) => {
      const newSorting = typeof updater === 'function' ? updater(oldSorting) : updater;
      const filteredSorting = newSorting.filter(sort => sort.id !== 'isStarred');
      return [{ id: 'isStarred', desc: true }, ...filteredSorting];
    });
  };

  // Add this effect in the DataTable component
  React.useEffect(() => {
      if (initialSelectedItems?.length) {
        const newRowSelection = initialSelectedItems.reduce((acc, item) => {
          const rowIndex = data.findIndex(dataItem => 
          (dataItem as any).id === (item as any).id
        );
        if (rowIndex !== -1) {
          acc[rowIndex] = true;
        }
        return acc;
      }, {} as Record<string, boolean>);
      
      setRowSelection(newRowSelection);
    }
  }, [data, initialSelectedItems]);

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    isStarred: false,
    select: enableSelection,
    actions: enableActions,
    sharedWith: enableSharedWith,
    type: false,
    icon: false,
    tags: false,
    owner: false,
    id: false,
})
  const [rowSelection, setRowSelection] = React.useState(() => {
    if (!initialSelectedItems?.length) return {};
    
    return initialSelectedItems.reduce((acc, item) => {
      const rowIndex = data.findIndex(dataItem => 
        (dataItem as any).id === (item as any).id
      );
      if (rowIndex !== -1) {
        acc[rowIndex] = true;
      }
      return acc;
    }, {} as Record<string, boolean>);
  });

  // Keep track of all selected items, not just the ones in the current view
  const [allSelectedItems, setAllSelectedItems] = React.useState<DemoItem[]>(initialSelectedItems);

  // Update allSelectedItems when initialSelectedItems changes
  React.useEffect(() => {
    setAllSelectedItems(initialSelectedItems);
  }, [initialSelectedItems]);

  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: pageSize
  })

  const [audioState, setAudioState] = React.useState<AudioState>({
    hoveredRow: null,
    playingRow: null,
    loadingRow: null,
    currentRow: null
  });

  const handleRowMouseEnter = (rowId: string) => {
    setAudioState(prev => ({ ...prev, hoveredRow: rowId }));
  };

  const handleRowMouseLeave = () => {
    setAudioState(prev => ({ ...prev, hoveredRow: null }));
  };

  const handlePlayToggle = async (rowId: string) => {
    const row = table.getRowModel().rowsById[rowId];
    if (!row) return;

    const currentTrack = row.original as DemoItem;
    const mediaPlayerStore = useMediaPlayerStore.getState();
    
    // If this row is current AND playing, pause it
    if (audioState.currentRow === rowId && mediaPlayerStore.isPlaying) {
      console.log('⏸️ Pausing current track');
      mediaPlayerStore.pauseTrack();
      setAudioState(prev => ({ ...prev, playingRow: null }));
      return;
    }

    try {
      // If we're switching to a different track
      if (mediaPlayerStore.currentTrackId !== (currentTrack as any).id) {
        console.log('🔄 Loading new track:', (currentTrack as any).name);
        setAudioState(prev => ({ 
          ...prev, 
          loadingRow: rowId,
          currentRow: rowId // Set current row when loading new track
        }));
        
        mediaPlayerStore.onPause = () => {
          console.log('📢 onPause callback triggered');
          setAudioState(prev => ({ ...prev, playingRow: null })); // Keep currentRow unchanged
        };

        await mediaPlayerStore.playTrack((currentTrack as any).id, (currentTrack as any).name, (currentTrack as any).filePath!);
        setAudioState(prev => ({ 
          ...prev, 
          playingRow: rowId, 
          loadingRow: null,
          currentRow: rowId 
        }));
      } else {
        console.log('▶️ Resuming existing track');
        mediaPlayerStore.resumeTrack();
        setAudioState(prev => ({ ...prev, playingRow: rowId }));
      }
    } catch (error) {
      console.error('❌ Failed to play audio:', error);
      setAudioState(prev => ({ 
        ...prev, 
        playingRow: null, 
        loadingRow: null 
      })); // Keep currentRow unchanged on error
    }
  };

  const handleRowDoubleClick = (row: Row<any>) => {
    const item = row.original as any;
    // Only handle double click for audio files
    if (item.format && isAudioFile(item.format)) {
      handlePlayToggle(row.id);
    }
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: handleSortingChange,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: (updater) => {
      const newSelection = typeof updater === 'function' 
        ? updater(rowSelection)
        : updater;
      
      setRowSelection(newSelection);
      
      if (onSelectionChange) {
        // Get newly selected/deselected items from the current view
        const selectedRows = table.getRowModel().rows.filter(row => {
          const rowId = row.id;
          return newSelection[rowId];
        });
        const currentViewSelectedItems = selectedRows.map(row => row.original as DemoItem);
        
        // Get IDs of items in current view
        const currentViewIds = data.map((item: any) => item.id);
        
        // Keep previously selected items that are not in current view
        const previouslySelectedItems = allSelectedItems.filter(
          item => !currentViewIds.includes((item as any).id)
        );
        
        // Combine with newly selected items
        const newSelectedItems = [...previouslySelectedItems, ...currentViewSelectedItems];
        
        setAllSelectedItems(newSelectedItems);
        onSelectionChange(newSelectedItems);
      }
    },
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination
    },
  })

  // Add helper function to determine if row is clickable
  const isRowClickable = (row: Row<any>) => {
    const item = row.original
    return item.type === ItemType.FOLDER
  }

  return (
    <div className="space-y-4">
      {/* Search Filter and Action Buttons Container */}
      {showSearch && (
        <div className="flex flex-row items-center pb-4 justify-between space-x-4 lg:space-y-0">
          <Input
            placeholder="Search files..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="w-full lg:max-w-sm"
          />
          <div className="flex items-center space-x-2" />
        </div>
      )}
  
      <div className={cn("rounded-md border", viewMode === 'grid' && "rounded-md border-none")}>
        {isLoading ? (
          <div className="flex items-center justify-center h-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : viewMode === 'table' ? (
          <Table>
            {showColumnHeaders && (
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
            )}
            <TableBody>
              {isLoading ? (
                // Single skeleton per row
                Array.from({ length: pageSize }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={columns.length}>
                      <Skeleton className="h-6 py-2 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                // Existing row rendering logic
                table.getRowModel().rows.map((row) => (
                  <TableRow 
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(
                      isRowClickable(row) && "hover:bg-muted/50",
                      isRowClickable(row) && "cursor-pointer",
                      audioState.currentRow === row.id && "bg-muted/50"
                    )}
                    onMouseEnter={() => handleRowMouseEnter(row.id)}
                    onMouseLeave={handleRowMouseLeave}
                    onClick={() => isRowClickable(row) && onRowClick?.(row.original)}
                    onDoubleClick={() => handleRowDoubleClick(row)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell, 
                          { ...cell.getContext(), audioState, onPlayToggle: handlePlayToggle }
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                // Existing no results row
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-12 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        ) : (
          <DataTableGridView
            table={table}
            enableSelection={enableSelection}
            enableRowLink={enableRowLink}
            onRowClick={onRowClick}
            onToggleStar={onToggleStar}
            />
        )}
      </div>
  
      {/* Pagination */}
      {showPagination && (
        <div className="py-4">
          <DataTablePagination table={table} />
        </div>
      )}
    </div>
  )
}

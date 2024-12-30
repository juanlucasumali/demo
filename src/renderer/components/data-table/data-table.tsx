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
import { cn } from "@renderer/lib/utils"
import { GridItem } from "./grid-item"
import { Skeleton } from "@renderer/components/ui/skeleton"
import { Card } from "@renderer/components/ui/card"
import { Loader2 } from "lucide-react"

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
  
      <div className="rounded-md border">
        {isLoading ? (
          <div className="flex items-center justify-center h-[100px]">
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
                      "cursor-pointer hover:bg-muted/50",
                      enableRowLink && "cursor-pointer"
                    )}
                    onClick={() => onRowClick?.(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                // Existing no results row
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
            {isLoading ? (
              Array.from({ length: pageSize }).map((_, i) => (
                <Card key={i} className="p-4">
                  <Skeleton className="h-12 w-12 rounded-full mb-4" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </Card>
              ))
            ) : table.getRowModel().rows?.length ? (
              // Existing grid items
              table.getRowModel().rows.map((row) => (
                <GridItem
                  key={row.id}
                  row={row}
                  isSelected={row.getIsSelected()}
                  onSelectionChange={(checked) => row.toggleSelected(!!checked)}
                  enableSelection={enableSelection}
                  enableRowLink={enableRowLink}
                />
              ))
            ) : (
              // Existing no results message
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No results.
              </div>
            )}
          </div>
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

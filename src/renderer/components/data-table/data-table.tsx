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

interface DataTableProps<DemoItem> {
  columns: ColumnDef<DemoItem>[]
  data: DemoItem[]
  enableSelection?: boolean
  enableActions?: boolean
  enableRowLink?: boolean
  viewMode?: 'table' | 'grid'
  pageSize?: number
  onSelectionChange?: (selectedItems: DemoItem[]) => void
  initialSelectedItems?: DemoItem[]
}

export function DataTable<DemoItem>({
  columns,
  data,
  enableSelection = false,
  enableActions = true,
  viewMode = 'table',
  pageSize = 10,
  onSelectionChange,
  initialSelectedItems = [],
  enableRowLink
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
    type: false,
    icon: false,
    tags: false,
    owner: false,
    sharedWith: false,
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
    <div>
      {/* Search Filter and Action Buttons Container */}
      <div className="flex flex-row items-center pb-4 justify-between space-x-4 lg:space-y-0">
        <Input
          placeholder="Search files..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="w-full lg:max-w-sm"
        />
  
        {/* Buttons Container */}
        <div className="flex items-center space-x-2">
        </div>
      </div>
  
      <div className={cn("rounded-md border", 
        viewMode === 'grid' && "border-none p-0"
      )}>
        {viewMode === 'table' ? (
          <Table>
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
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {table.getRowModel().rows?.length ? (
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
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No results.
              </div>
            )}
          </div>
        )}
      </div>
  
      {/* Pagination */}
      <div className="py-4">
        <DataTablePagination table={table} />
      </div>
    </div>
  )
}

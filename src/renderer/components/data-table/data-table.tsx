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
import { SubHeader } from "@renderer/components/page-layout/sub-header"
import { File } from "lucide-react"
import { cn } from "@renderer/lib/utils"
import { GridItem } from "./grid-item"

interface DataTableProps<DemoItem> {
  columns: ColumnDef<DemoItem>[]
  data: DemoItem[]
  enableSelection?: boolean
  enableStarToggle?: boolean
  enableActions?: boolean
  viewMode?: 'table' | 'grid'
}

export function DataTable<DemoItem>({
  columns,
  data,
  enableSelection = false,
  enableStarToggle = true,
  enableActions = true,
  viewMode = 'table'
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
    actions: !enableActions
  })
  const [rowSelection, setRowSelection] = React.useState({})

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
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <GridItem
                  key={row.id}
                  row={row}
                  isSelected={row.getIsSelected()}
                  onSelectionChange={(checked) => row.toggleSelected(!!checked)}
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

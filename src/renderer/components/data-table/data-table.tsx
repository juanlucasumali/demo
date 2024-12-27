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

interface DataTableProps<DemoItem> {
  columns: ColumnDef<DemoItem>[]
  data: DemoItem[]
  enableSelection?: boolean
  enableStarToggle?: boolean
  enableActions?: boolean
}

export function DataTable<DemoItem>({
  columns,
  data,
  enableSelection = false,
  enableStarToggle = true,
  enableActions = true,
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

        {/* Search Filter */}
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

      {/* Table Rows */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
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
      </div>

      {/* Rows selected & Pagination */}
      <div className="py-4">
        <DataTablePagination table={table} />
      </div>

    </div>
  )
}

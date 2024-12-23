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
} from "../ui/table"
import { Button } from "@renderer/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Input } from "@renderer/components/ui/input"
import { DataTablePagination } from "./data-table-pagination"
import { File, Folder, Package } from "lucide-react"
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog"

interface DataTableProps<DemoItem> {
  columns: ColumnDef<DemoItem>[]
  data: DemoItem[]
}

export function DataTable<DemoItem>({
  columns,
  data,
}: DataTableProps<DemoItem>) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'isStarred', desc: true }, // true first
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
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
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
      <div className="flex flex-col lg:flex-row items-center py-4 justify-between space-y-4 lg:space-y-0">

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
        
          {/* Upload File */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full lg:w-auto">
                <File className="text-muted-foreground mr-2" /> Upload File
              </Button>
            </DialogTrigger>
            <DialogContent>
              {/* Implement uploading file Dialog */}
            </DialogContent>
          </Dialog>
          
          {/* Create Folder */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full lg:w-auto">
                <Folder className="text-muted-foreground mr-2" /> Create Folder
              </Button>
            </DialogTrigger>
            <DialogContent>
              {/* Implement creating folder Dialog */}
            </DialogContent>
          </Dialog>

          {/* Create Project */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full lg:w-auto">
                <Package className="text-muted-foreground mr-2" /> Create Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              {/* Implement creating folder Dialog */}
            </DialogContent>
          </Dialog>

          {/* Column Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full lg:w-auto">
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter(column => column.getCanHide())
                .map(column => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
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
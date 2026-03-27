/**
 * DataTable — Reusable sortable, filterable, paginated table
 *
 * Phase D.3: Built against the DataTableProps interface from Phase C.7.
 * Used across all engine detail pages for consistent data display.
 */

'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import type { DataTableProps, DataTableColumn } from './types';
import { PAGE_SIZE_OPTIONS } from './types';

export function DataTable<T>({
  columns,
  data,
  total,
  loading = false,
  page = 0,
  pageSize = 25,
  onPageChange,
  onPageSizeChange,
  sortField,
  sortDirection = 'desc',
  onSortChange,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  onRowClick,
  getRowId,
  emptyMessage = 'No data found',
  showSearch = true,
  showPagination = true,
}: DataTableProps<T>) {
  const totalRows = total ?? data.length;
  const totalPages = Math.ceil(totalRows / pageSize);

  const handleSort = (column: DataTableColumn<T>) => {
    if (!column.sortable || !onSortChange) return;
    const newDirection = sortField === column.id && sortDirection === 'asc' ? 'desc' : 'asc';
    onSortChange(column.id, newDirection);
  };

  const renderSortIcon = (column: DataTableColumn<T>) => {
    if (!column.sortable) return null;
    if (sortField !== column.id) return <ChevronsUpDown className="ml-1 h-3 w-3 opacity-30" />;
    return sortDirection === 'asc'
      ? <ChevronUp className="ml-1 h-3 w-3" />
      : <ChevronDown className="ml-1 h-3 w-3" />;
  };

  const renderCell = (column: DataTableColumn<T>, row: T) => {
    if (column.cell) return column.cell(row);
    if (column.accessorFn) {
      const value = column.accessorFn(row);
      return value !== null && value !== undefined ? String(value) : '—';
    }
    const value = (row as Record<string, unknown>)[column.id];
    return value !== null && value !== undefined ? String(value) : '—';
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-3">
        {showSearch && <Skeleton className="h-10 w-64" />}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map(col => (
                  <TableHead key={col.id} style={{ width: col.width }}>{col.header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map(col => (
                    <TableCell key={col.id}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search */}
      {showSearch && onSearchChange && (
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-sm"
        />
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map(col => (
                <TableHead
                  key={col.id}
                  style={{ width: col.width }}
                  className={col.sortable ? 'cursor-pointer select-none hover:bg-muted/50' : ''}
                  onClick={() => handleSort(col)}
                >
                  <div className="flex items-center">
                    {col.header}
                    {renderSortIcon(col)}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map(row => (
                <TableRow
                  key={getRowId(row)}
                  className={onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map(col => (
                    <TableCell key={col.id}>{renderCell(col, row)}</TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, totalRows)} of {totalRows}
          </div>
          <div className="flex items-center gap-2">
            {onPageSizeChange && (
              <select
                className="h-8 rounded border bg-background px-2 text-sm"
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
              >
                {PAGE_SIZE_OPTIONS.map(size => (
                  <option key={size} value={size}>{size} / page</option>
                ))}
              </select>
            )}
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => onPageChange?.(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              {page + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => onPageChange?.(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

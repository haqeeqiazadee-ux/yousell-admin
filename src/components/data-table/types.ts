/**
 * DataTable Component Interface
 *
 * Reusable sortable, filterable, paginated table for engine pages.
 * Phase C.7: Interface only — implementation comes in Phase D.
 */

// ─── Column Definition ─────────────────────────────────────

export interface DataTableColumn<T> {
  /** Unique column identifier (maps to data key) */
  id: string;
  /** Display header text */
  header: string;
  /** Whether this column is sortable */
  sortable?: boolean;
  /** Column width (CSS value, e.g., '200px', '20%') */
  width?: string;
  /** Custom render function for cell content */
  cell?: (row: T) => React.ReactNode;
  /** Accessor function to get the raw value (for sorting/filtering) */
  accessorFn?: (row: T) => string | number | boolean | null;
}

// ─── Table Props ───────────────────────────────────────────

export interface DataTableProps<T> {
  /** Column definitions */
  columns: DataTableColumn<T>[];
  /** Data rows */
  data: T[];
  /** Total row count (for server-side pagination) */
  total?: number;
  /** Whether data is currently loading */
  loading?: boolean;
  /** Current page (0-indexed) */
  page?: number;
  /** Rows per page */
  pageSize?: number;
  /** Callback when page changes */
  onPageChange?: (page: number) => void;
  /** Callback when page size changes */
  onPageSizeChange?: (size: number) => void;
  /** Current sort field */
  sortField?: string;
  /** Current sort direction */
  sortDirection?: 'asc' | 'desc';
  /** Callback when sort changes */
  onSortChange?: (field: string, direction: 'asc' | 'desc') => void;
  /** Search/filter value */
  searchValue?: string;
  /** Callback when search changes */
  onSearchChange?: (value: string) => void;
  /** Placeholder text for the search input */
  searchPlaceholder?: string;
  /** Callback when a row is clicked */
  onRowClick?: (row: T) => void;
  /** Key extractor for stable row keys */
  getRowId: (row: T) => string;
  /** Empty state message */
  emptyMessage?: string;
  /** Whether to show the search input */
  showSearch?: boolean;
  /** Whether to show pagination */
  showPagination?: boolean;
}

// ─── Page Size Options ─────────────────────────────────────

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;
export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

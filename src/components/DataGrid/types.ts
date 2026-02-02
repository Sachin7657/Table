export type ValidationResult =
  | { valid: true }
  | { valid: false; message: string }

export interface Column<T> {
  id: string
  header: string
  width: number
  minWidth?: number
  maxWidth?: number
  pinned?: 'left' | 'right'
  visible?: boolean
  sortable?: boolean
  resizable?: boolean
  renderCell: (row: T) => React.ReactNode
  getSortValue?: (row: T) => string | number
  renderEditor?: (params: {
    value: unknown
    row: T
    onChange: (value: unknown) => void
    onCommit: (value: unknown) => void
    onCancel: () => void
  }) => React.ReactNode
  validate?: (
    value: unknown,
    row: T
  ) => Promise<ValidationResult>
}
export interface DataGridProps<T> {
  rows: T[]
  columns: Column<T>[]
  rowHeight: number
  sortState?: SortState[]
  onSortChange?: (next: SortState[]) => void
  onEditCommit?: (params: {
    rowIndex: number
    columnId: string
    value: unknown
  }) => Promise<void> | void
}
export type SortDirection = 'asc' | 'desc'

export interface SortState {
  columnId: string
  direction: SortDirection
}
export type UndoAction =
  | {
      type: 'column-resize'
      columnId: string
      prevWidth: number
      nextWidth: number
    }
  | {
      type: 'column-reorder'
      prevOrder: string[]
      nextOrder: string[]
    }
  | {
      type: 'cell-edit'
      key: string
      prevValue: unknown
      nextValue: unknown
    }
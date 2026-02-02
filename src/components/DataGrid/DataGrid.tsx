
import React, { useRef, useState, useLayoutEffect } from 'react'
import type { SortState, DataGridProps, Column, UndoAction } from './types'

const OVERSCAN = 5
 const COLUMN_OVERSCAN_PX = 200
function getZone<T>(col: Column<T>) {
  return col.pinned === 'left' ? 'left' : 'center'
}


export function DataGrid<T>({
  rows,
  columns,
  rowHeight = 36,
  sortState,
  onSortChange,
  onEditCommit
}: DataGridProps<T>) {
  const [columnOrder, setColumnOrder] = React.useState<string[]>(
  () => columns.map(c => c.id)
)
  const orderedColumns = React.useMemo(() => {
    const map = new Map(columns.map(c => [c.id, c]))
    return columnOrder
      .map(id => map.get(id))
      .filter((c): c is Column<T> => !!c && c.visible !== false)
  }, [columns, columnOrder])
  
  const navigableColumns = React.useMemo(() => orderedColumns, [orderedColumns])

  const pinnedColumns = orderedColumns.filter((c) => c.pinned === 'left')
  // const scrollableColumns = columns.filter((c) => !c.pinned)

  const [scrollTop, setScrollTop] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  const [activeCell, setActiveCell] = React.useState<{
    rowIndex: number
    colIndex: number
  } | null>(null)
  const [editingCell, setEditingCell] = React.useState<{
    rowIndex: number
    colId: string
  } | null>(null)

  const [editError, setEditError] = React.useState<string | null>(null)
  const [isSaving, setIsSaving] = React.useState(false)

  const [columnWidths, setColumnWidths] = React.useState(() => {
    const map = new Map<string, number>()
    for (const col of columns) {
      map.set(col.id, col.width)
    }
    return map
  })
  const [optimisticEdits, setOptimisticEdits] = React.useState<
    Map<string, unknown>
  >(new Map())
  const [undoStack, setUndoStack] = React.useState<UndoAction[]>([])

  const columnMeta = React.useMemo(() => {
    let offset = 0
    return orderedColumns.map((col, gridIndex) => {
      const width = columnWidths.get(col.id)!
      const meta = {
        column: col,
        start: offset,
        end: offset + width,
        width,
        gridIndex
      }
      offset += width
      return meta
    })
  }, [orderedColumns, columnWidths])

  const resizingRef = React.useRef<{
    columnId: string
    startX: number
    startWidth: number
    currentWidth?: number
  } | null>(null)
  const dragColId = React.useRef<string | null>(null)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const [viewportHeight, setViewportHeight] = useState(0)
  const viewportWidth = containerRef.current?.clientWidth ?? 0


 
  const visibleStartX = scrollLeft - COLUMN_OVERSCAN_PX
  const visibleEndX = scrollLeft + viewportWidth + COLUMN_OVERSCAN_PX
  const virtualColumns = React.useMemo(() => {
    return columnMeta.filter((meta) => {
      if (meta.column.pinned === 'left') return false
      return meta.end >= visibleStartX && meta.start <= visibleEndX
    })
  }, [columnMeta, visibleStartX, visibleEndX])

  const pinnedOffSet = React.useMemo(() => {
    let offSet = 0
    const map = new Map<string, number>()
    for (const col of pinnedColumns) {
      map.set(col.id, offSet)
      offSet += columnWidths.get(col.id)!
    }
    return map
  }, [pinnedColumns, columnWidths])
  const pinnedColumnMeta = columnMeta.filter((m) => m.column.pinned === 'left')
  const renderColumns = [...pinnedColumnMeta, ...virtualColumns]
  

  useLayoutEffect(() => {
    if (containerRef.current) {
      setViewportHeight(containerRef.current.clientHeight)
    }
  }, [])

  React.useEffect(() => {
    if (!activeCell) return

    const top = activeCell.rowIndex * rowHeight
    const bottom = top + rowHeight

    const viewTop = scrollTop
    const viewBottom = scrollTop + viewportHeight

    if (top < viewTop) {
      containerRef.current?.scrollTo({ top })
    } else if (bottom > viewBottom) {
      containerRef.current?.scrollTo({
        top: bottom - viewportHeight
      })
    }
  }, [activeCell, rowHeight, scrollTop, viewportHeight])

  const sortedRows = React.useMemo(() => {
    if (!sortState || sortState.length === 0) {
      return rows
    }

    const rowsCopy = [...rows]

    rowsCopy.sort((a, b) => {
      for (const sort of sortState) {
        const column = columns.find((c) => c.id === sort.columnId)
        if (!column || column.sortable === false || !column.getSortValue) {
          continue
        }

        const aValue = column.getSortValue(a)
        const bValue = column.getSortValue(b)

        if (aValue === bValue) continue

        if (sort.direction === 'asc') {
          return aValue > bValue ? 1 : -1
        } else {
          return aValue < bValue ? 1 : -1
        }
      }

      return 0
    })

    return rowsCopy
  }, [rows, columns, sortState])

  const totalRows = sortedRows.length
  const startIndex = Math.floor(scrollTop / rowHeight)
  const visibleRowCount = Math.ceil(viewportHeight / rowHeight)
  const endIndex = Math.min(totalRows, startIndex + visibleRowCount + OVERSCAN)
  const visibleRows = sortedRows.slice(startIndex, endIndex)
  const topSpacerHeight = startIndex * rowHeight
  const bottomSpacerHeight = (totalRows - endIndex) * rowHeight

  const totalGridWidth = React.useMemo(() => {
    return columnMeta.length ? columnMeta[columnMeta.length - 1].end : 0
  }, [columnMeta])

  function toggleSort(columnId: string) {
    if (!onSortChange) return

    const current = sortState ?? []
    const existing = current.find((s) => s.columnId === columnId)

    let next: SortState[]

    if (!existing) {
      next = [...current, { columnId, direction: 'asc' }]
    } else if (existing.direction === 'asc') {
      next = current.map((s) =>
        s.columnId === columnId ? { ...s, direction: 'desc' } : s
      )
    } else {
      next = current.filter((s) => s.columnId !== columnId)
    }

    onSortChange(next)
  }

  function commitColumnReorder(nextOrder: string[]) {
    setUndoStack(prev => [
      ...prev,
      {
        type: 'column-reorder',
        prevOrder: columnOrder,
        nextOrder
      }
    ])

    setColumnOrder(nextOrder)
  }

  function undoLastAction() {
  setUndoStack(prev => {
    const last = prev[prev.length - 1]
    if (!last) return prev

    switch (last.type) {
      case 'column-resize':
        setColumnWidths(w => {
          const next = new Map(w)
          next.set(last.columnId, last.prevWidth)
          return next
        })
        break

      case 'column-reorder':
        setColumnOrder(last.prevOrder)
        break

      case 'cell-edit':
        // Parse the key to get rowIndex and columnId
        const [rowIndexStr, columnId] = last.key.split(':')
        const rowIndex = parseInt(rowIndexStr, 10)
        
        // Call onEditCommit to revert the data in the parent component
        onEditCommit?.({
          rowIndex,
          columnId,
          value: last.prevValue
        })
        
        // Also update optimisticEdits for immediate visual feedback
        setOptimisticEdits(edits => {
          const next = new Map(edits)
          if (last.prevValue === undefined) {
            next.delete(last.key)
          } else {
            next.set(last.key, last.prevValue)
          }
          return next
        })
        break
    }

    return prev.slice(0, -1)
  })
}
  function handleGridKeyDown(e: React.KeyboardEvent) {
    if (!activeCell) return

    let { rowIndex, colIndex } = activeCell

    if (e.key === 'Escape' && editingCell) {
      e.preventDefault()
      setEditingCell(null)
      setEditError(null)
      return
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
  e.preventDefault()
  undoLastAction()
  return
}

    if (e.key === 'Enter' && activeCell && !editingCell) {
      const column = navigableColumns[activeCell.colIndex]
      if (!column.renderEditor) return

      e.preventDefault()
      setEditError(null)
      setEditingCell({
        rowIndex: activeCell.rowIndex,
        colId: column.id
      })
      return
    }

    switch (e.key) {
      case 'ArrowRight':
        colIndex = Math.min(colIndex + 1, navigableColumns.length - 1)
        break
      case 'ArrowLeft':
        colIndex = Math.max(colIndex - 1, 0)
        break
      case 'ArrowDown':
        rowIndex = Math.min(rowIndex + 1, totalRows - 1)
        break
      case 'ArrowUp':
        rowIndex = Math.max(rowIndex - 1, 0)
        break
      default:
        return
    }

    e.preventDefault()
    setActiveCell({ rowIndex, colIndex })
  }

  async function commitEdit(row: T, column: Column<T>, rowIndex: number, editedValue: unknown) {
    if (!column.renderEditor) return

    const key = `${rowIndex}:${column.id}`
    const value = editedValue

    try {
      setIsSaving(true)
      setEditError(null)

      // Get the actual current value from the row data, not from optimisticEdits
      const prevValue = column.getSortValue ? column.getSortValue(row) : undefined

      setUndoStack(prev => [
        ...prev,
        {
          type: 'cell-edit',
          key,
          prevValue,
          nextValue: value
        }
      ])

      setOptimisticEdits(prev => {
        const next = new Map(prev)
        next.set(key, value)
        return next
      })


      if (column.validate) {
        const result = await column.validate(value, row)
        if (!result.valid) {
          setEditError(result.message)
          return
        }
      }

      await onEditCommit?.({
        rowIndex,
        columnId: column.id,
        value
      })

      setOptimisticEdits(prev => {
      const next = new Map(prev)
      next.delete(key)
      return next
    })

      setEditingCell(null)
    } catch (err) {
      setOptimisticEdits(prev => {
      const next = new Map(prev)
      next.delete(key)
      return next
    })
      setEditError(
        err instanceof Error ? err.message : 'Failed to save'
      )
    } finally {
      setIsSaving(false)
    }
  }
  function onResizeMouseDown(e: React.MouseEvent, columnId: string) {
    e.preventDefault()
    e.stopPropagation()

    resizingRef.current = {
      columnId,
      startX: e.clientX,
      startWidth: columnWidths.get(columnId)!
    }

    window.addEventListener('mousemove', onResizeMouseMove)
    window.addEventListener('mouseup', onResizeMouseUp)
  }

  function onResizeMouseMove(e: MouseEvent) {
    const state = resizingRef.current
    if (!state) return

    const column = columns.find((c) => c.id === state.columnId)
    if (!column) return

    const delta = e.clientX - state.startX
    let nextWidth = state.startWidth + delta

    if (column.minWidth) nextWidth = Math.max(nextWidth, column.minWidth)
    if (column.maxWidth) nextWidth = Math.min(nextWidth, column.maxWidth)

    // Store the current width for undo
    state.currentWidth = nextWidth

    setColumnWidths((prev) => {
      const next = new Map(prev)
      next.set(state.columnId, nextWidth)
      return next
    })
  }

  function onResizeMouseUp() {
    const state = resizingRef.current
    if(state){
      const prevWidth = state.startWidth
      const nextWidth = state.currentWidth ?? columnWidths.get(state.columnId)!

      if (prevWidth !== nextWidth) {
        setUndoStack(prev => [
          ...prev,
          {
            type: 'column-resize',
            columnId: state.columnId,
            prevWidth,
            nextWidth
          }
        ])
      }
    }
    resizingRef.current = null
    window.removeEventListener('mousemove', onResizeMouseMove)
    window.removeEventListener('mouseup', onResizeMouseUp)
  }

  function getCellValue(row: T, rowIndex: number, column: Column<T>) {
    const key = `${rowIndex}:${column.id}`
    if (optimisticEdits.has(key)) {
      return optimisticEdits.get(key)
    }
    return column.getSortValue ? column.getSortValue(row) : undefined
  }
  


  return (
    <div
      ref={containerRef}
      role="grid"
      tabIndex={0}
      aria-rowcount={totalRows}
      aria-colcount={orderedColumns.length}
      onKeyDown={handleGridKeyDown}
      onFocus={() => {
        if (!activeCell) {
          setActiveCell({ rowIndex: 0, colIndex: 0 })
        }
      }}
      className="flex flex-col border border-gray-800 rounded-md overflow-auto relative"
      style={{ height: 400, width: '100%' }} // fixed viewport height and width
      onScroll={(e) => {
        setScrollTop(e.currentTarget.scrollTop)
        setScrollLeft(e.currentTarget.scrollLeft)
      }}
    >
      <div aria-live="assertive" className="sr-only">
        {isSaving
          ? 'Saving cell'
          : editError
            ? `Error: ${editError}`
            : ''}
      </div>
      <div aria-live="polite" className="sr-only" id="column-reorder-status" />
      <div className="relative flex-none" style={{ width: totalGridWidth }}>
        {/* Header */}
        <div
          role="row"
          aria-rowindex={1}
          className="sticky top-0 z-10 flex flex-row bg-gray-700 border-b border-gray-300"
        >
          {renderColumns.map(({ column, gridIndex }) => {
            const isPinned = column.pinned === 'left'
            const sortInfo = sortState?.find((s) => s.columnId === column.id)
            const isSortable = column.sortable !== false

            return (
              <div
                key={column.id}
                draggable={true}
                onDragStart={() => {
                  dragColId.current = column.id
                }}
                onDragOver={(e) => {
                  e.preventDefault()
                }}
                onDrop={() => {
                  const from = dragColId.current
                  if (!from || from === column.id) return

                  const fromCol = columns.find(c => c.id === from)!
                  const toCol = column

                  if (getZone(fromCol) !== getZone(toCol)) return

                  const next = [...columnOrder]
                  const fromIdx = next.indexOf(from)
                  const toIdx = next.indexOf(column.id)

                  next.splice(fromIdx, 1)
                  next.splice(toIdx, 0, from)
                  
                  commitColumnReorder(next)

                  document.getElementById('column-reorder-status')!.textContent =
                    `${fromCol.header} moved`

                  dragColId.current = null
                }}
                className={`relative px-2 py-1 text-sm font-medium border-r select-none last:border-r-0 ${isPinned ? 'sticky bg-gray-100 z-20' : ''} ${isSortable ? 'cursor-pointer hover:bg-gray-600' : ''}`}
                style={{
                  width: columnWidths.get(column.id)!,
                  left: isPinned ? pinnedOffSet.get(column.id) : undefined
                }}
                onClick={() => {
                  if (isSortable) {
                    toggleSort(column.id)
                  }
                }}
                role="columnheader"
                aria-colindex={gridIndex + 1}
                aria-grabbed={activeCell?.colIndex === gridIndex && activeCell?.rowIndex === -1}
                aria-roledescription="reorderable column"
                aria-sort={
                  sortInfo
                    ? sortInfo.direction === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : isSortable
                      ? 'none'
                      : undefined
                }
                aria-label={
                  isSortable
                    ? `${column.header}, sortable column${sortInfo ? `, sorted ${sortInfo.direction === 'asc' ? 'ascending' : 'descending'}` : ''}`
                    : column.header
                }
                tabIndex={isSortable ? 0 : -1}
                onKeyDown={(e) => {
                  if (e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
                    e.preventDefault()

                    const idx = columnOrder.indexOf(column.id)
                    const delta = e.key === 'ArrowLeft' ? -1 : 1
                    const nextIdx = idx + delta

                    if (nextIdx < 0 || nextIdx >= columnOrder.length) return

                    const fromCol = columns.find(c => c.id === columnOrder[idx])!
                    const toCol = columns.find(c => c.id === columnOrder[nextIdx])!

                    if (getZone(fromCol) !== getZone(toCol)) return

                    const next = [...columnOrder]
                    ;[next[idx], next[nextIdx]] = [next[nextIdx], next[idx]]
                    
                    commitColumnReorder(next)
                    
                    document.getElementById('column-reorder-status')!.textContent =
                      `${column.header} moved`
                    
                    return
                  }

                  if (!isSortable) return
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    toggleSort(column.id)
                  }
                }}
              >
                <span className="flex items-center gap-1">
                  {column.header}
                  {sortInfo && (
                    <span className="text-xs">
                      {sortInfo.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </span>
                {column.resizable !== false && (
                  <div
                    role="separator"
                    aria-orientation="vertical"
                    tabIndex={0}
                    className="
                      absolute right-0 top-0 h-full w-1
                      cursor-col-resize
                      hover:bg-blue-500
                    "
                    onMouseDown={(e) => onResizeMouseDown(e, column.id)}
                    onKeyDown={(e) => {
                      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')
                        return

                      e.preventDefault()
                      const delta = e.key === 'ArrowRight' ? 10 : -10

                      const prevWidth = columnWidths.get(column.id)!
                      const nextWidth = Math.max(40, prevWidth + delta)

                      if (prevWidth !== nextWidth) {
                        setUndoStack(prev => [
                          ...prev,
                          {
                            type: 'column-resize',
                            columnId: column.id,
                            prevWidth,
                            nextWidth
                          }
                        ])

                        setColumnWidths((prev) => {
                          const next = new Map(prev)
                          next.set(column.id, nextWidth)
                          return next
                        })
                      }
                    }}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Body */}
        <div>
          <div style={{ height: topSpacerHeight }} />

          {visibleRows.map((row, rowIndex) => {
            const absoluteRowIndex = startIndex + rowIndex

            return (
              <div
                key={absoluteRowIndex}
                role="row"
                aria-rowindex={absoluteRowIndex + 2}
                className="flex border-b border-gray-200 last:border-b-0"
                style={{ height: rowHeight }}
              >
                {renderColumns.map(({ column, gridIndex }) => {
                  const isEditing =
                    editingCell?.rowIndex === absoluteRowIndex &&
                    editingCell?.colId === column.id

                  const isPinned = column.pinned === 'left'
                  const isActive =
                    activeCell?.rowIndex === absoluteRowIndex &&
                    activeCell?.colIndex === gridIndex

                  return (
                    <div
                      key={column.id}
                      role="gridcell"
                      tabIndex={isActive ? 0 : -1}
                      aria-selected={isActive}
                      className={`px-2 py-1 text-sm border-r border-gray-200 last:border-r-0 flex items-center ${isPinned ? 'sticky bg-white z-10' : ''} ${isActive ? 'outline-2 outline-blue-500' : ''}`}
                      style={{
                        width: columnWidths.get(column.id)!,
                        left: isPinned ? pinnedOffSet.get(column.id) : undefined
                      }}
                      onFocus={() => {
                        setActiveCell({
                          rowIndex: absoluteRowIndex,
                          colIndex: gridIndex
                        })
                      }}
                    >
                      {isEditing && column.renderEditor ? (
                        <div
                          role="textbox"
                          aria-invalid={!!editError}
                          aria-describedby={
                            editError ? 'edit-error' : undefined
                          }
                        >
                          {column.renderEditor({
                            value: column.getSortValue
                              ? column.getSortValue(row)
                              : undefined,
                            row,
                            onChange: () => {
                              // uncontrolled — editor owns state
                            },
                            onCommit: async (editedValue: unknown) => {
                              await commitEdit(row, column, absoluteRowIndex, editedValue)
                            },
                            onCancel: () => {
                              setEditingCell(null)
                              setEditError(null)
                            }
                          })}
                          {editError && (
                            <div
                              id="edit-error"
                              className="text-xs text-red-600"
                            >
                              {editError}
                            </div>
                          )}
                        </div>
                      ) : (
                        column.renderCell({
                          ...row,
                          [column.id]: getCellValue(
                            row,
                            absoluteRowIndex,
                            column
                          )
                        } as T)
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}
          <div style={{ height: bottomSpacerHeight }} />
        </div>
      </div>
    </div>
  )
}

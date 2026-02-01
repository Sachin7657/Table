import React, { useRef, useState, useLayoutEffect } from 'react'
import type { DataGridProps } from './types'

const OVERSCAN = 5

export function DataGrid<T>({
  rows,
  columns,
  rowHeight = 36
}: DataGridProps<T>) {
  const visibleColumns = columns.filter((col) => col.visible !== false)
  const pinnedColumns = visibleColumns.filter((c) => c.pinned === 'left')
  const scrollableColumns = columns.filter((c) => !c.pinned)

  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [viewportHeight, setViewportHeight] = useState(0)

  const pinnedOffSet = React.useMemo(() => {
    let offSet = 0
    const map = new Map<string, number>()
    for (const col of pinnedColumns) {
      map.set(col.id, offSet)
      offSet += col.width
    }
    return map
  }, [pinnedColumns])

  useLayoutEffect(() => {
    if (containerRef.current) {
      setViewportHeight(containerRef.current.clientHeight)
    }
  }, [])

  const totalRows = rows.length
  const startIndex = Math.floor(scrollTop / rowHeight)
  const visibleRowCount = Math.ceil(viewportHeight / rowHeight)
  const endIndex = Math.min(totalRows, startIndex + visibleRowCount + OVERSCAN)
  const visibleRows = rows.slice(startIndex, endIndex)
  const topSpacerHeight = startIndex * rowHeight
  const bottomSpacerHeight = (totalRows - endIndex) * rowHeight

  const totalGridWidth = React.useMemo(() => {
    return visibleColumns.reduce((sum, col) => sum + col.width, 0)
  }, [visibleColumns])

  

  return (
    <div
    ref={containerRef}
      className="flex flex-col border border-gray-800 rounded-md overflow-auto relative"
      style={{ height: 400, width: '100%' }} // fixed viewport height and width
      onScroll={(e) => {
        setScrollTop(e.currentTarget.scrollTop)
      }}
    >
      <div className="relative flex-none" style={{ width: totalGridWidth }}>
        {/* Header */}
        <div className="sticky top-0 z-10 flex flex-row bg-gray-700 border-b border-gray-300">
          {visibleColumns.map((column) => {
            const isPinned = column.pinned === 'left'
            return (
              <div
                key={column.id}
                className={`px-2 py-1 text-sm font-medium border-r last:border-r-0 ${isPinned ? 'sticky bg-gray-100 z-20' : ''}`}
                style={{
                  width: column.width,
                  left: isPinned ? pinnedOffSet.get(column.id) : undefined
                }}
              >
                {column.header}
              </div>
            )
          })}
        </div>

        {/* Body */}
        <div>
          <div style={{ height: topSpacerHeight }} />

          {visibleRows.map((row, rowIndex) => (
            <div
              key={startIndex + rowIndex}
              className="flex border-b border-gray-200 last:border-b-0"
              style={{ height: rowHeight }}
            >
              {visibleColumns.map((column) => {
                const isPinned = column.pinned === 'left'
                return (
                  <div
                    key={column.id}
                    className={`px-2 py-1 text-sm border-r border-gray-200 last:border-r-0 flex items-center ${isPinned ? 'sticky bg-white z-10' : ''}`}
                    style={{
                      width: column.width,
                      left: isPinned ? pinnedOffSet.get(column.id) : undefined
                    }}
                  >
                    {column.renderCell(row)}
                  </div>
                )
              })}
            </div>
          ))}
          <div style={{ height: bottomSpacerHeight }} />
        </div>
      </div>
    </div>
  )
}

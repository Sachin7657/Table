import type { Meta, StoryObj } from "@storybook/react"
import { DataGrid } from "../components/DataGrid"
import type { Column } from "../components/DataGrid"
import React, { useState } from "react"

type Person = {
  name: string
  email: string
  age: number
  role: string
  status: string
  department: string
  location: string
  salary: number
  joinDate: string
  manager: string
}

const columns: Column<Person>[] = [
  {
    id: "name",
    header: "Name",
    width: 160,
    renderCell: (row) => row.name,
    getSortValue: (row) => row.name,
    resizable: true,
    renderEditor: ({ value, onCommit, onCancel }) => {
      let inputRef: HTMLInputElement | null = null
      return (
        <input
          ref={el => { inputRef = el }}
          defaultValue={value as string}
          autoFocus
          className="w-full border px-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter') onCommit(inputRef?.value)
            if (e.key === 'Escape') onCancel()
          }}
        />
      )
    },
    sortable: true,
  },
  {
    id: "email",
    header: "Email",
    width: 240,
    renderCell: (row) => row.email,
    getSortValue: (row) => row.email,
    resizable: true,
    renderEditor: ({ value, onCommit, onCancel }) => {
      let inputRef: HTMLInputElement | null = null
      return (
        <input
          ref={el => { inputRef = el }}
          defaultValue={value as string}
          autoFocus
          className="w-full border px-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter') onCommit(inputRef?.value)
            if (e.key === 'Escape') onCancel()
          }}
        />
      )
    },
    sortable: true,
  },
  {
    id: "age",
    header: "Age",
    width: 80,
    renderCell: (row) => row.age,
    getSortValue: (row) => row.age,
    resizable: false,
    renderEditor: ({ value, onCommit, onCancel }) => {
      let inputRef: HTMLInputElement | null = null
      return (
        <input
          ref={el => { inputRef = el }}
          defaultValue={value as string}
          autoFocus
          className="w-full border px-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter') onCommit(inputRef?.value)
            if (e.key === 'Escape') onCancel()
          }}
        />
      )
    },
    sortable: true,
  },
  {
    id: "role",
    header: "Role",
    width: 140,
    renderCell: (row) => row.role,
    getSortValue: (row) => row.role,
    resizable: true,
    renderEditor: ({ value, onCommit, onCancel }) => {
      let inputRef: HTMLInputElement | null = null
      return (
        <input
          ref={el => { inputRef = el }}
          defaultValue={value as string}
          autoFocus
          className="w-full border px-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter') onCommit(inputRef?.value)
            if (e.key === 'Escape') onCancel()
          }}
        />
      )
    },
    sortable: true,
  },
  {
    id: "status",
    header: "Status",
    width: 120,
    renderCell: (row) => row.status,
    getSortValue: (row) => row.status,
    renderEditor: ({ value, onCommit, onCancel }) => {
      let inputRef: HTMLInputElement | null = null
      return (
        <input
          ref={el => { inputRef = el }}
          defaultValue={value as string}
          autoFocus
          className="w-full border px-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter') onCommit(inputRef?.value)
            if (e.key === 'Escape') onCancel()
          }}
        />
      )
    },
    sortable: true,
  },
  {
    id: "department",
    header: "Department",
    width: 150,
    renderCell: (row) => row.department,
    getSortValue: (row) => row.department,
    sortable: true,
  },
  {
    id: "location",
    header: "Location",
    width: 140,
    renderCell: (row) => row.location,
    getSortValue: (row) => row.location,
    sortable: true,
  },
  {
    id: "salary",
    header: "Salary",
    width: 120,
    renderCell: (row) => `$${row.salary.toLocaleString()}`,
    getSortValue: (row) => row.salary,
    sortable: true,
  },
  {
    id: "joinDate",
    header: "Join Date",
    width: 120,
    renderCell: (row) => row.joinDate,
    getSortValue: (row) => row.joinDate,
    sortable: true,
  },
  {
    id: "manager",
    header: "Manager",
    width: 150,
    renderCell: (row) => row.manager,
    getSortValue: (row) => row.manager,
    sortable: true,
  }
]

const departments = ["Engineering", "Marketing", "Sales", "HR", "Finance"];
const locations = ["New York", "London", "Tokyo", "Sydney", "Berlin"];
const managers = ["John Smith", "Jane Doe", "Bob Wilson", "Alice Brown", "Charlie Davis"];

const rows: Person[] = Array.from({ length: 50000 }).map((_, i) => ({
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  age: 20 + (i % 10),
  role: i % 2 === 0 ? "Admin" : "User",
  status: i % 3 === 0 ? "Active" : "Inactive",
  department: departments[i % departments.length],
  location: locations[i % locations.length],
  salary: 50000 + (i % 10) * 10000,
  joinDate: `202${i % 4}-0${(i % 9) + 1}-15`,
  manager: managers[i % managers.length],
}))

const meta: Meta<typeof DataGrid<Person>> = {
  title: "DataGrid/Basic",
  component: DataGrid<Person>,
}

export default meta

type Story = StoryObj<typeof DataGrid<Person>>

export const Basic: Story = {
  render: (args) => {
    const [sortState, setSortState] = useState(args.sortState || [])
    const [data, setData] = useState(args.rows || [])
    
    // Optimized: Only update the specific row, don't copy entire array
    const handleEditCommit = React.useCallback(({ rowIndex, columnId, value }: { rowIndex: number; columnId: string; value: unknown }) => {
      setData(prevData => {
        // Create shallow copy of array
        const newData = prevData.slice()
        // Only copy the affected row
        newData[rowIndex] = {
          ...newData[rowIndex],
          [columnId]: value
        }
        return newData
      })
    }, [])
    
    return (
      <DataGrid 
        {...args}
        rows={data}
        sortState={sortState}
        onSortChange={setSortState}
        onEditCommit={handleEditCommit}
      />
    )
  },
  args: {
    rows,
    columns,
    rowHeight: 36,
  },
}

export const LargeDataset: Story = {
  render: (args) => {
    const [sortState, setSortState] = useState(args.sortState || [])
    
    return (
      <div>
        <div style={{ marginBottom: '1rem', padding: '0.5rem', background: '#f0f0f0', borderRadius: '4px' }}>
          <strong>Virtualization Demo:</strong> 50,000 rows - Only visible rows are rendered.
          Check console for virtualization stats.
        </div>
        <DataGrid 
          {...args}
          sortState={sortState}
          onSortChange={setSortState}
        />
      </div>
    )
  },
  args: {
    rows,
    columns,
    rowHeight: 36,
  },
}

export const EditableCells: Story = {
  render: (args) => {
    const [data, setData] = useState(args.rows || [])
    const [isSaving, setIsSaving] = useState(false)
    
    const handleEditCommit = React.useCallback(async ({ rowIndex, columnId, value }: { rowIndex: number; columnId: string; value: unknown }) => {
      setIsSaving(true)
      
      // Simulate async save
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setData(prevData => {
        const newData = prevData.slice()
        newData[rowIndex] = {
          ...newData[rowIndex],
          [columnId]: value
        }
        return newData
      })
      
      setIsSaving(false)
    }, [])
    
    return (
      <div>
        <div style={{ marginBottom: '1rem', padding: '0.5rem', background: '#f0f0f0', borderRadius: '4px' }}>
          <strong>Instructions:</strong> Click a cell, press Enter to edit, press Enter again to save.
          {isSaving && <span style={{ marginLeft: '1rem', color: '#0066cc' }}>Saving...</span>}
        </div>
        <DataGrid 
          {...args}
          rows={data}
          onEditCommit={handleEditCommit}
        />
      </div>
    )
  },
  args: {
    rows: rows.slice(0, 20),
    columns,
    rowHeight: 36,
  },
}

export const EditValidationFailure: Story = {
  render: (args) => {
    const [data, setData] = useState(args.rows || [])
    const [lastError, setLastError] = useState<string | null>(null)
    
    const handleEditCommit = React.useCallback(async ({ rowIndex, columnId, value }: { rowIndex: number; columnId: string; value: unknown }) => {
      // Simulate validation failure for emails without "@"
      if (columnId === 'email' && typeof value === 'string' && !value.includes('@')) {
        setLastError(`Invalid email: ${value}`)
        
        // Clear error after 3 seconds
        setTimeout(() => setLastError(null), 3000)
        return
      }
      
      // Simulate async save
      await new Promise(resolve => setTimeout(resolve, 300))
      
      setData(prevData => {
        const newData = prevData.slice()
        newData[rowIndex] = {
          ...newData[rowIndex],
          [columnId]: value
        }
        return newData
      })
      
      setLastError(null)
    }, [])
    
    return (
      <div>
        <div style={{ marginBottom: '1rem', padding: '0.5rem', background: '#f0f0f0', borderRadius: '4px' }}>
          <strong>Try:</strong> Edit email to remove "@" symbol - validation will fail
          {lastError && (
            <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#fee', color: '#c00', borderRadius: '4px' }}>
              ❌ {lastError}
            </div>
          )}
        </div>
        <DataGrid 
          {...args}
          rows={data}
          onEditCommit={handleEditCommit}
        />
      </div>
    )
  },
  args: {
    rows: rows.slice(0, 10),
    columns,
    rowHeight: 36,
  },
}

export const KeyboardNavigation: Story = {
  render: (args) => {
    const [data, setData] = useState(args.rows || [])
    
    const handleEditCommit = React.useCallback(({ rowIndex, columnId, value }: { rowIndex: number; columnId: string; value: unknown }) => {
      setData(prevData => {
        const newData = prevData.slice()
        newData[rowIndex] = {
          ...newData[rowIndex],
          [columnId]: value
        }
        return newData
      })
    }, [])
    
    return (
      <div>
        <div style={{ marginBottom: '1rem', padding: '0.5rem', background: '#f0f0f0', borderRadius: '4px' }}>
          <strong>Keyboard shortcuts:</strong>
          <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
            <li>Arrow keys: Navigate cells</li>
            <li>Enter: Start editing</li>
            <li>Escape: Cancel editing or deselect cell</li>
            <li>Ctrl+Z: Undo last action</li>
          </ul>
        </div>
        <DataGrid 
          {...args}
          rows={data}
          onEditCommit={handleEditCommit}
        />
      </div>
    )
  },
  args: {
    rows: rows.slice(0, 15),
    columns,
    rowHeight: 36,
  },
}

export const PinnedColumns: Story = {
  render: (args) => {
    const [sortState, setSortState] = useState(args.sortState || [])
    
    const pinnedColumns: Column<Person>[] = [
      {
        ...columns[0],
        pinned: 'left',
      },
      ...columns.slice(1),
    ]
    
    return (
      <div>
        <div style={{ marginBottom: '1rem', padding: '0.5rem', background: '#f0f0f0', borderRadius: '4px' }}>
          <strong>Pinned column:</strong> Name column stays fixed when scrolling horizontally
        </div>
        <DataGrid 
          {...args}
          columns={pinnedColumns}
          sortState={sortState}
          onSortChange={setSortState}
        />
      </div>
    )
  },
  args: {
    rows: rows.slice(0, 50),
    columns,
    rowHeight: 36,
  },
}

export const ColumnResize: Story = {
  render: (args) => {
    return (
      <div>
        <div style={{ marginBottom: '1rem', padding: '0.5rem', background: '#f0f0f0', borderRadius: '4px' }}>
          <strong>Resize columns:</strong>
          <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
            <li>Mouse: Drag column border</li>
            <li>Keyboard: Focus border (Tab), then use Arrow Left/Right</li>
            <li>Ctrl+Z to undo resize</li>
          </ul>
        </div>
        <DataGrid {...args} />
      </div>
    )
  },
  args: {
    rows: rows.slice(0, 20),
    columns,
    rowHeight: 36,
  },
}

export const EmptyState: Story = {
  render: (args) => {
    return (
      <div>
        <div style={{ marginBottom: '1rem', padding: '0.5rem', background: '#f0f0f0', borderRadius: '4px' }}>
          <strong>Empty grid:</strong> No data, but ARIA structure remains valid
        </div>
        <DataGrid {...args} />
      </div>
    )
  },
  args: {
    rows: [],
    columns,
    rowHeight: 36,
  },
}

export const AccessibilityMode: Story = {
  render: (args) => {
    const [data, setData] = useState(args.rows || [])
    
    const handleEditCommit = React.useCallback(({ rowIndex, columnId, value }: { rowIndex: number; columnId: string; value: unknown }) => {
      setData(prevData => {
        const newData = prevData.slice()
        newData[rowIndex] = {
          ...newData[rowIndex],
          [columnId]: value
        }
        return newData
      })
    }, [])
    
    return (
      <div>
        <div style={{ marginBottom: '1rem', padding: '0.5rem', background: '#f0f0f0', borderRadius: '4px' }}>
          <strong>Accessibility features:</strong>
          <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
            <li>ARIA grid role with proper row/cell semantics</li>
            <li>Screen reader announcements for edits and errors</li>
            <li>Keyboard-only navigation</li>
            <li>Focus management</li>
          </ul>
        </div>
        <DataGrid 
          {...args}
          rows={data}
          onEditCommit={handleEditCommit}
        />
      </div>
    )
  },
  args: {
    rows: rows.slice(0, 20),
    columns,
    rowHeight: 36,
  },
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
          {
            id: 'focus-order-semantics',
            enabled: true,
          },
        ],
      },
    },
  },
}

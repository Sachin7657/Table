import type { Meta, StoryObj } from "@storybook/react"
import { DataGrid } from "../components/DataGrid"
import type { Column } from "../components/DataGrid"
import { useState } from "react"

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

const rows: Person[] = Array.from({ length: 5000 }).map((_, i) => ({
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
    
    const handleEditCommit = ({ rowIndex, columnId, value }: { rowIndex: number; columnId: string; value: unknown }) => {
      setData(prevData => {
        const newData = [...prevData]
        newData[rowIndex] = {
          ...newData[rowIndex],
          [columnId]: value
        }
        return newData
      })
    }
    
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

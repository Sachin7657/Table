import type { Meta, StoryObj } from "@storybook/react"
import { DataGrid } from "../components/DataGrid"
import type { Column } from "../components/DataGrid"

type Person = {
  name: string
  email: string
  age: number
  role: string
  status: string
}

const columns: Column<Person>[] = [
  {
    id: "name",
    header: "Name",
    width: 160,
    renderCell: (row) => row.name,
  },
  {
    id: "email",
    header: "Email",
    width: 240,
    renderCell: (row) => row.email,
  },
  {
    id: "age",
    header: "Age",
    width: 80,
    renderCell: (row) => row.age,
  },
  {
    id: "role",
    header: "Role",
    width: 140,
    renderCell: (row) => row.role,
  },
  {
    id: "status",
    header: "Status",
    width: 120,
    renderCell: (row) => row.status,
  },
  {
    id: "status",
    header: "Status",
    width: 120,
    renderCell: (row) => row.status,
  },
  {
    id: "status",
    header: "Status",
    width: 120,
    renderCell: (row) => row.status,
  },
  {
    id: "status",
    header: "Status",
    width: 120,
    renderCell: (row) => row.status,
  },
  {
    id: "status",
    header: "Status",
    width: 120,
    renderCell: (row) => row.status,
  },
  {
    id: "status",
    header: "Status",
    width: 120,
    renderCell: (row) => row.status,
  },
  {
    id: "status",
    header: "Status",
    width: 120,
    renderCell: (row) => row.status,
  },
  {
    id: "status",
    header: "Status",
    width: 120,
    renderCell: (row) => row.status,
  },
  {
    id: "status",
    header: "Status",
    width: 120,
    renderCell: (row) => row.status,
  }
]

const rows: Person[] = Array.from({ length: 5000 }).map((_, i) => ({
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  age: 20 + (i % 10),
  role: i % 2 === 0 ? "Admin" : "User",
  status: i % 3 === 0 ? "Active" : "Inactive",
}))

const meta: Meta<typeof DataGrid<Person>> = {
  title: "DataGrid/Basic",
  component: DataGrid<Person>,
}

export default meta

type Story = StoryObj<typeof DataGrid<Person>>

export const Basic: Story = {
  args: {
    rows,
    columns,
    rowHeight: 36,
  },
}

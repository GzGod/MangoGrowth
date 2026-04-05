import type { ReactNode } from 'react'

type Column<Row> = {
  key: string
  header: string
  cell: (row: Row) => ReactNode
}

type DataTableProps<Row> = {
  columns: Column<Row>[]
  rows: Row[]
  testId?: string
}

function DataTable<Row>({ columns, rows, testId }: DataTableProps<Row>) {
  return (
    <div className="table-shell" data-testid={testId}>
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td key={column.key}>{column.cell(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default DataTable

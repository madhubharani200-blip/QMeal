export default function AdminTable({ columns, rows, empty = 'No data' }) {
  if (!rows.length) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-300 bg-white/70 p-8 text-center text-muted">
        {empty}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-stone-100">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-stone-50 text-muted">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="px-4 py-3 font-medium">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id || i} className="border-t border-stone-100">
              {columns.map((c) => (
                <td key={c.key} className="px-4 py-3">
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

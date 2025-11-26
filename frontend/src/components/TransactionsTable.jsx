const columns = [
  { id: 'gatewayRef', label: 'Ref', render: (row) => row.gatewayRef || '—' },
  { id: 'amount', label: 'Amount', render: (row) => `₹${row.amount?.toLocaleString() || 0}` },
  { id: 'status', label: 'Status', render: (row) => row.status },
  { id: 'paymentMethod', label: 'Method', render: (row) => row.paymentMethod },
  { id: 'gateway', label: 'Gateway', render: (row) => row.gateway },
  { id: 'failureCode', label: 'Failure Code', render: (row) => row.failureCode || '—' },
  { id: 'failureReason', label: 'Failure Reason', render: (row) => row.failureReason || '—' },
  {
    id: 'createdAt',
    label: 'Created',
    render: (row) => (row.createdAt ? new Date(row.createdAt).toLocaleString() : '—'),
  },
];

function isAllowed(fieldList, id) {
  if (!fieldList || fieldList.length === 0) return true;
  if (fieldList.includes('*')) return true;
  return fieldList.includes(id);
}

export default function TransactionsTable({ transactions, visibleFields, loading, onRowClick }) {
  const shownColumns = columns.filter((col) => isAllowed(visibleFields, col.id));
  return (
    <div className="card overflow-hidden bg-slate/40">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white">Recent Transactions</h3>
        <div className="text-xs text-slate/60">
          Showing {transactions.length} item{transactions.length === 1 ? '' : 's'}
        </div>
      </div>
      <div className="mt-3 overflow-x-auto overflow-y-auto max-h-[420px]">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 bg-slate/70 backdrop-blur">
            <tr className="text-left text-slate/60">
              {shownColumns.map((col) => (
                <th key={col.id} className="px-3 py-2 whitespace-nowrap">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={shownColumns.length} className="px-3 py-4 text-center text-slate/60">
                  Loading...
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={shownColumns.length} className="px-3 py-4 text-center text-slate/60">
                  No transactions
                </td>
              </tr>
            ) : (
              transactions.map((row) => (
                <tr
                  key={row._id}
                  className={`border-t border-slate/10 ${onRowClick ? 'cursor-pointer hover:bg-white/5' : ''}`}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {shownColumns.map((col) => (
                    <td key={col.id} className="px-3 py-2 whitespace-nowrap text-slate/80">
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

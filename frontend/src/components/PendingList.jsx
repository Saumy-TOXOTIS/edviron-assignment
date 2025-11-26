export default function PendingList({ items }) {
  return (
    <div className="card bg-gradient-to-b from-slate/40 to-slate/10">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold">Top Pending Payments</h3>
        <span className="text-xs text-slate/60">({items.length})</span>
      </div>
      <div className="mt-3 space-y-2 max-h-96 overflow-y-auto pr-1">
        {items.length === 0 ? (
          <div className="text-sm text-slate/60">All clear!</div>
        ) : (
          items.map((item) => (
            <div
              key={item.billNo}
              className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-3 py-2 shadow-sm"
            >
              <div>
                <div className="text-sm font-medium text-white">{item.studentName}</div>
                <div className="text-xs text-slate/50">
                  {item.className} {item.section} · Due{' '}
                  {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : '—'}
                </div>
              </div>
              <div className="text-sm font-semibold text-rose-400">₹{item.pending?.toLocaleString()}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

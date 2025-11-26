import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

function formatValue(v) {
  if (Number.isNaN(v) || v == null) return '—';
  return currency.format(v);
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const due = payload.find((p) => p.dataKey === 'due');
  const collected = payload.find((p) => p.dataKey === 'collected');
  return (
    <div className="rounded-lg border border-white/10 bg-slate/80 px-3 py-2 text-xs text-white shadow-lg backdrop-blur">
      <div className="font-semibold text-sm">{label}</div>
      <div className="mt-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-slate-400" />
          <span>Due:</span>
          <span className="font-medium">{formatValue(due?.value)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-sky" />
          <span>Collected:</span>
          <span className="font-medium">{formatValue(collected?.value)}</span>
        </div>
      </div>
    </div>
  );
}

export default function SummaryChart({ data }) {
  const chartData = data.map((item) => ({
    group: item.group || 'All',
    due: item.totalDue,
    collected: item.totalCollected,
    rate: item.collectionRate,
  }));

  if (!chartData.length) {
    return (
      <div className="card h-72 bg-gradient-to-b from-slate/50 to-slate/20 flex items-center justify-center text-slate/60">
        No collection data available for the selected filters.
      </div>
    );
  }

  return (
    <div className="card h-80 bg-gradient-to-b from-slate/50 to-slate/20 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h3 className="font-semibold text-white">Collections Over Time</h3>
          <span className="text-xs text-slate/60">Grouped by period (₹)</span>
        </div>
        <span className="text-xs text-slate/60">due vs collected</span>
      </div>
      <div className="mt-2 flex-1 px-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 20 }}>
            <defs>
              <linearGradient id="colorDue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.7} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="group" />
            <YAxis tickFormatter={formatValue} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="due" stroke="#475569" fill="url(#colorDue)" />
            <Area type="monotone" dataKey="collected" stroke="#06b6d4" fill="url(#colorCollected)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="pt-2 flex items-center justify-center gap-4 text-sm text-slate/70">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-slate-400" />
          <span>due</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-sky" />
          <span>collected</span>
        </div>
      </div>
    </div>
  );
}

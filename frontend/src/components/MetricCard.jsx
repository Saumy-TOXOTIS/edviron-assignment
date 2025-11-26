export default function MetricCard({ title, value, hint }) {
  return (
    <div className="card border-white/10 bg-gradient-to-br from-slate/50 to-slate/20">
      <div className="text-sm text-slate/60">{title}</div>
      <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
      {hint ? <div className="text-xs text-slate/50 mt-1">{hint}</div> : null}
    </div>
  );
}

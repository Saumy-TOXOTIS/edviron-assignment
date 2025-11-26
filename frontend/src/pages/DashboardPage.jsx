import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import MetricCard from '../components/MetricCard';
import SummaryChart from '../components/SummaryChart';
import TransactionsTable from '../components/TransactionsTable';
import PendingList from '../components/PendingList';
import { fetchPendingFees, fetchSummary, fetchTransactions, downloadPendingCsv } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const paymentOptions = ['upi', 'card', 'netbanking', 'cash', 'cheque'];
const statusOptions = ['success', 'failed', 'pending'];

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState([]);
  const [pending, setPending] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [txnTotal, setTxnTotal] = useState(0);
  const [failures, setFailures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [txnFilters, setTxnFilters] = useState({ status: '', paymentMethod: '' });
  const [txnPage, setTxnPage] = useState(1);
  const [txnLimit, setTxnLimit] = useState(50);

  const visibleTxnFields = useMemo(() => {
    const perms = user?.permissions?.transactions;
    const fields = perms?.read || perms?.readFields || ['*'];
    return fields.includes('*') ? ['*'] : fields;
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [summaryRes, txnRes, pendingRes, failedRes] = await Promise.all([
          fetchSummary({ by: 'month' }),
          fetchTransactions({ ...txnFilters, page: txnPage, limit: txnLimit }),
          fetchPendingFees(),
          fetchTransactions({ status: 'failed', limit: 5 }),
        ]);
        setSummary(summaryRes.data.summary || []);
        setTransactions(txnRes.data.data || []);
        setTxnTotal(txnRes.data.total || 0);
        setPending(pendingRes.data.pending || []);
        setFailures(failedRes.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, txnFilters, txnPage, txnLimit]);

  const overall = summary[0] || { totalDue: 0, totalCollected: 0, collectionRate: 0 };

  const handleFilterChange = (field) => (e) => {
    setTxnPage(1);
    setTxnFilters((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const totalPages = Math.max(1, Math.ceil((txnTotal || 0) / txnLimit));
  const handlePageChange = (delta) => () => {
    setTxnPage((p) => Math.min(totalPages, Math.max(1, p + delta)));
  };

  const handleDownloadPending = async () => {
    try {
      const res = await downloadPendingCsv();
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'pending_payments.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || 'Download failed');
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold text-white">Payments Dashboard</h1>
            <p className="text-sm text-slate/60">
              Field-level visibility enforced for your role ({user?.role}).
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 text-xs text-slate/60">
              <div>
                Visible transaction fields: {visibleTxnFields.includes('*') ? 'all' : visibleTxnFields.join(', ')}
              </div>
              <button
                type="button"
                className="btn px-3 py-1 text-sm border border-emerald-300 text-emerald-100 hover:bg-emerald-900/30"
                onClick={handleDownloadPending}
              >
                Download Pending CSV
              </button>
          </div>
        </div>

        {error ? (
          <div className="rounded-lg border border-rose-400 bg-rose-900/40 px-3 py-2 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-4">
          <MetricCard title="Total Due" value={`₹${(overall.totalDue || 0).toLocaleString()}`} hint="Sum of amount_due" />
          <MetricCard title="Collected" value={`₹${(overall.totalCollected || 0).toLocaleString()}`} hint="Sum of amount_paid" />
          <MetricCard title="Collection Rate" value={`${overall.collectionRate || 0}%`} hint="collected / due" />
          <MetricCard title="Recent Failures" value={failures.length} hint="last 5 failed txns" />
        </div>

        <div className="grid gap-4 lg:grid-cols-3 items-stretch">
          <div className="lg:col-span-2 h-full">
            <SummaryChart data={summary} />
          </div>
          <div className="h-full">
            <PendingList items={pending} />
          </div>
        </div>

        <div className="card flex flex-wrap items-center gap-3 border-white/10 bg-slate/30">
          <div className="text-sm font-medium text-white">Transaction filters</div>
          <select
            className="rounded-lg border border-slate/20 px-3 py-2 text-sm outline-none focus:border-sky focus:ring-1 focus:ring-sky/40"
            value={txnFilters.status}
            onChange={handleFilterChange('status')}
          >
            <option value="">All status</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            className="rounded-lg border border-slate/20 px-3 py-2 text-sm outline-none focus:border-sky focus:ring-1 focus:ring-sky/40"
            value={txnFilters.paymentMethod}
            onChange={handleFilterChange('paymentMethod')}
          >
            <option value="">All methods</option>
            {paymentOptions.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <select
            className="rounded-lg border border-slate/20 px-3 py-2 text-sm outline-none focus:border-sky focus:ring-1 focus:ring-sky/40"
            value={txnLimit}
            onChange={(e) => {
              setTxnLimit(Number(e.target.value));
              setTxnPage(1);
            }}
          >
            {[20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n} per page
              </option>
            ))}
          </select>
          <span className="text-xs text-slate/60">Only columns you can access are rendered.</span>
        </div>

        <TransactionsTable
          transactions={transactions}
          visibleFields={visibleTxnFields}
          loading={loading}
          onRowClick={(row) => navigate(`/transactions/${row._id}`)}
        />
          <div className="flex flex-wrap items-center justify-between text-xs text-slate/60">
            <div>
              Showing {transactions.length} of {txnTotal || transactions.length} items (page {txnPage} / {totalPages})
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn px-3 py-1 text-sm border border-amber-300 text-amber-200 hover:bg-amber-900/20"
                onClick={handlePageChange(-1)}
                disabled={txnPage <= 1}
              >
                Prev
              </button>
              <button
                type="button"
                className="btn px-3 py-1 text-sm border border-emerald-400 text-emerald-200 hover:bg-emerald-900/30"
                onClick={handlePageChange(1)}
                disabled={txnPage >= totalPages}
              >
                Next
              </button>
            </div>
        </div>
      </div>
    </Layout>
  );
}

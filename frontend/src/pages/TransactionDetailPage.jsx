import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { fetchTransactionById } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export default function TransactionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [txn, setTxn] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchTransactionById(id);
        setTxn(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load transaction');
      }
    };
    load();
  }, [id]);

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">Transaction Details</h1>
            <p className="text-sm text-slate/60">User: {user?.email}</p>
          </div>
          <button
            type="button"
            className="btn px-3 py-1 text-sm border border-white/10 text-slate/70 hover:text-white hover:bg-white/10"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
        </div>
        {error ? <div className="rounded-lg border border-rose-400 bg-rose-900/40 px-3 py-2 text-sm text-rose-100">{error}</div> : null}
        {txn ? (
          <div className="card space-y-2">
            <div className="text-sm text-slate/60">Reference</div>
            <div className="text-lg font-semibold text-white">{txn.gatewayRef || txn._id}</div>
            <div className="grid gap-3 md:grid-cols-2 mt-3">
              <Detail label="Amount" value={`₹${txn.amount?.toLocaleString() || 0}`} />
              <Detail label="Status" value={txn.status} />
              <Detail label="Method" value={txn.paymentMethod} />
              <Detail label="Gateway" value={txn.gateway} />
              <Detail label="Failure Code" value={txn.failureCode || '—'} />
              <Detail label="Failure Reason" value={txn.failureReason || '—'} />
              <Detail label="Bill" value={txn.feeBill?.billNo || '—'} />
              <Detail label="Student" value={txn.student?.name || '—'} />
              <Detail label="Created" value={txn.createdAt ? new Date(txn.createdAt).toLocaleString() : '—'} />
              <Detail label="Completed" value={txn.completedAt ? new Date(txn.completedAt).toLocaleString() : '—'} />
            </div>
          </div>
        ) : null}
      </div>
    </Layout>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-slate/60">{label}</div>
      <div className="text-sm text-white">{value}</div>
    </div>
  );
}

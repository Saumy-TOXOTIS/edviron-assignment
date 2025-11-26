import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('ChangeMe123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto flex min-h-[calc(100vh-140px)] max-w-5xl items-center justify-center px-4">
        <div className="w-full max-w-md card bg-slate/40 border-white/10 shadow-xl">
          <h1 className="text-xl font-semibold text-white">Welcome back</h1>
          <p className="text-sm text-slate/60 mt-1">Log in to view the payments dashboard.</p>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label className="text-sm text-slate/70">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate/20 px-3 py-2 outline-none focus:border-sky focus:ring-1 focus:ring-sky/40"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-slate/70">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate/20 px-3 py-2 pr-12 outline-none focus:border-sky focus:ring-1 focus:ring-sky/40 transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-1 my-1 flex items-center rounded-md px-3 text-sm text-slate/70 transition hover:scale-105 hover:bg-slate/10 hover:text-sky active:scale-95"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            {error ? <div className="text-sm text-rose-600">{error}</div> : null}
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
            <div className="text-xs text-slate/60">
              Tip: Super admin credentials are pre-filled (`admin@example.com` / `ChangeMe123!`).
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}

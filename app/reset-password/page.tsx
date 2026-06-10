'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';

function ResetContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push('/login');
    } else {
      setError('Invalid or expired link.');
    }
  }

  return (
    <div>
      <h1>Reset Password</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <input
            data-testid="password"
            type="password"
            placeholder="New password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: 8, fontSize: 14 }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <input
            data-testid="confirm"
            type="password"
            placeholder="Confirm password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
            style={{ width: '100%', padding: 8, fontSize: 14 }}
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button data-testid="submit" type="submit" disabled={loading}
          style={{ padding: '8px 24px', cursor: 'pointer' }}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ResetContent />
    </Suspense>
  );
}

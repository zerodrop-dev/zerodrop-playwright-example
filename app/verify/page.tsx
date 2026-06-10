'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!token) { setStatus('error'); return; }
    fetch(`/api/auth/verify?token=${token}`)
      .then(res => {
        if (res.ok || res.redirected) {
          setStatus('success');
          window.location.href = '/dashboard';
        } else {
          setStatus('error');
        }
      })
      .catch(() => setStatus('error'));
  }, [token]);

  if (status === 'loading') return <p>Verifying...</p>;
  if (status === 'error') return <p>Invalid or expired link.</p>;
  return <p>Verified! Redirecting...</p>;
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <VerifyContent />
    </Suspense>
  );
}

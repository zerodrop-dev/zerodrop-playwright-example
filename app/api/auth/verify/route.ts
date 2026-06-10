import { NextResponse } from 'next/server';
import { getToken, deleteToken, verifyUser } from '@/lib/store';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 400 });
  }

  const tokenData = getToken(token);

  if (!tokenData || tokenData.type !== 'verify' || tokenData.expires < Date.now()) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
  }

  verifyUser(tokenData.email);
  deleteToken(token);

  return NextResponse.redirect(new URL('/dashboard', request.url));
}

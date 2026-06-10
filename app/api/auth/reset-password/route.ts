import { NextResponse } from 'next/server';
import { getToken, deleteToken, updatePassword } from '@/lib/store';

export async function POST(request: Request) {
  const { token, password } = await request.json();

  if (!token || !password) {
    return NextResponse.json({ error: 'Token and password required' }, { status: 400 });
  }

  const tokenData = getToken(token);

  if (!tokenData || tokenData.type !== 'reset' || tokenData.expires < Date.now()) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
  }

  updatePassword(tokenData.email, password);
  deleteToken(token);

  return NextResponse.json({ success: true });
}

import { NextResponse } from 'next/server';
import { getUser, createToken } from '@/lib/store';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }

  const user = getUser(email);
  if (!user) {
    // Don't reveal whether user exists
    return NextResponse.json({ success: true });
  }

  const token = createToken(email, 'reset');
  await sendPasswordResetEmail(email, token);

  return NextResponse.json({ success: true });
}

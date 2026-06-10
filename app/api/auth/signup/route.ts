import { NextResponse } from 'next/server';
import { createUser, getUser, createToken } from '@/lib/store';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
  }

  if (getUser(email)) {
    return NextResponse.json({ error: 'User already exists' }, { status: 409 });
  }

  createUser(email, password);
  const token = createToken(email, 'verify');
  await sendVerificationEmail(email, token);

  return NextResponse.json({ success: true });
}

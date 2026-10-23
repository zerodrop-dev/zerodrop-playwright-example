import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Resend sends only from a domain you've verified in your Resend account
// (https://resend.com/domains). Its shared onboarding@resend.dev sends only to
// your own address, so it can't reach a ZeroDrop inbox.
function sender() {
  const from = process.env.RESEND_FROM;
  if (!from) {
    throw new Error(
      'RESEND_FROM is not set. Set it to an address on a domain you verified in Resend, e.g. "Auth <auth@yourdomain.com>".'
    );
  }
  return from;
}

// resend.emails.send() returns most failures in `error` instead of throwing.
// Throw them, so the request fails at once and the server log says why,
// rather than the test waiting for an email that was never sent.
function check(error: { message: string } | null, what: string) {
  if (error) throw new Error(`Resend couldn't send the ${what}: ${error.message}`);
}

export async function sendVerificationEmail(to: string, token: string) {
  const link = `${BASE_URL}/api/auth/verify?token=${token}`;
  const { error } = await resend.emails.send({
    from: sender(),
    to,
    subject: 'Please verify your email address',
    html: `
      <h2>Verify your email</h2>
      <p>Click the link below to verify your email address:</p>
      <a href="${link}">${link}</a>
      <p>This link expires in 30 minutes.</p>
    `,
  });
  check(error, 'verification email');
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const link = `${BASE_URL}/reset-password?token=${token}`;
  const { error } = await resend.emails.send({
    from: sender(),
    to,
    subject: 'Reset your password',
    html: `
      <h2>Reset your password</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${link}">${link}</a>
      <p>This link expires in 30 minutes.</p>
    `,
  });
  check(error, 'password reset email');
}

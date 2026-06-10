import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

export async function sendVerificationEmail(to: string, token: string) {
  const link = `${BASE_URL}/verify?token=${token}`;
  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to,
    subject: 'Please verify your email address',
    html: `
      <h2>Verify your email</h2>
      <p>Click the link below to verify your email address:</p>
      <a href="${link}">${link}</a>
      <p>This link expires in 30 minutes.</p>
    `,
  });
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const link = `${BASE_URL}/reset-password?token=${token}`;
  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to,
    subject: 'Reset your password',
    html: `
      <h2>Reset your password</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${link}">${link}</a>
      <p>This link expires in 30 minutes.</p>
    `,
  });
}

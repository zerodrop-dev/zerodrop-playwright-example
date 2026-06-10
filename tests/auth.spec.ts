import { test, expect } from '@playwright/test';
import { ZeroDrop } from 'zerodrop-client';

const TEST_INBOX = process.env.TEST_INBOX || null;

test.describe.serial('Email verification flow', () => {
  let inbox: string;
  let mail: ZeroDrop;

  test.beforeAll(() => {
    mail = new ZeroDrop();
    inbox = TEST_INBOX ?? mail.generateInbox();
    console.log(`[zerodrop] Using inbox: ${inbox}`);
  });

  test('user can sign up and verify email', async ({ page }) => {
    // 1. Sign up
    await page.goto('/signup');

    // 2. Fill in the form with the disposable inbox
    await page.fill('[data-testid="email"]', inbox);
    await page.fill('[data-testid="password"]', 'TestPassword123!');

    // Listen for the API response to catch errors
    const responsePromise = page.waitForResponse('/api/auth/signup');
    await page.click('[data-testid="submit"]');
    const response = await responsePromise;
    
    console.log(`[test] Signup response status: ${response.status()}`);
    const body = await response.json();
    console.log(`[test] Signup response body: ${JSON.stringify(body)}`);

    expect(response.status()).toBe(200);

    // 3. Should redirect to check email page
    await expect(page).toHaveURL('/signup/check-email', { timeout: 10000 });

    // 4. Wait for the verification email
    const email = await mail.waitForLatest(inbox, { timeout: 30000 });
    expect(email).not.toBeNull();
    console.log(`[test] Email subject: ${email.subject}`);
    expect(email.subject.toLowerCase()).toContain('verify');

    // 5. Extract the verification link
    const linkMatch = email.body.match(/https?:\/\/\S+token=\S+/);
    expect(linkMatch).not.toBeNull();
    console.log(`[test] Verification link: ${linkMatch![0]}`);

    // 6. Click the verification link
    await page.goto(linkMatch![0]);

    // 7. Assert verified — redirected to dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
    await expect(page.getByText('Email verified')).toBeVisible();
  });

  test('user can request a password reset', async ({ page }) => {
    // 1. Go to forgot password
    await page.goto('/forgot-password');

    // 2. Submit reset request
    await page.fill('[data-testid="email"]', inbox);
    
    const responsePromise = page.waitForResponse('/api/auth/forgot-password');
    await page.click('[data-testid="submit"]');
    const response = await responsePromise;
    console.log(`[test] Reset response status: ${response.status()}`);

    // 3. Wait for reset email
    const email = await mail.waitForLatest(inbox, { timeout: 30000 });
    console.log(`[test] Reset email subject: ${email.subject}`);
    expect(email.subject.toLowerCase()).toContain('reset');

    // 4. Extract reset link
    const linkMatch = email.body.match(/https?:\/\/\S+token=\S+/);
    expect(linkMatch).not.toBeNull();

    // 5. Use reset link
    await page.goto(linkMatch![0]);
    await page.fill('[data-testid="password"]', 'NewPassword456!');
    await page.fill('[data-testid="confirm"]', 'NewPassword456!');
    await page.click('[data-testid="submit"]');

    // 6. Assert success
    await expect(page).toHaveURL('/login', { timeout: 10000 });
  });
});

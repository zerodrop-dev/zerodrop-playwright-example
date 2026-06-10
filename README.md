# zerodrop-playwright-example

> E2E email verification testing with Playwright and ZeroDrop

[![CI](https://github.com/zerodrop-dev/zerodrop-playwright-example/actions/workflows/ci.yml/badge.svg)](https://github.com/zerodrop-dev/zerodrop-playwright-example/actions/workflows/ci.yml)

No Docker. No SMTP. No MailHog. Just `npm install` and a real inbox.

---

## What this demonstrates

Testing auth flows that send emails (verification links, password resets, magic links) is painful. Most teams either:

- Mock the email sending layer (doesn't test real delivery)
- Run MailHog in Docker (adds CI overhead and maintenance)
- Skip the test entirely

This repo shows a third option: catch real emails in CI using [ZeroDrop](https://zerodrop.dev) — a disposable inbox that works over HTTP with no infrastructure.

---

## How it works

```yaml
# .github/workflows/ci.yml

- name: Generate ZeroDrop test inbox
  id: inbox
  uses: zerodrop-dev/create-inbox@v1

- name: Run Playwright tests
  run: npx playwright test
  env:
    TEST_INBOX: ${{ steps.inbox.outputs.inbox }}
```

```typescript
// tests/auth.spec.ts

import { ZeroDrop } from 'zerodrop-client';

const mail = new ZeroDrop();
const inbox = process.env.TEST_INBOX ?? mail.generateInbox();

// Sign up with the disposable inbox
await page.fill('[data-testid="email"]', inbox);
await page.click('[data-testid="submit"]');

// Wait for the real verification email
const email = await mail.waitForLatest(inbox, { timeout: 15000 });
const link = email.body.match(/https?:\/\/\S+verify\S+/)?.[0];

// Click it
await page.goto(link);
```

No mocking. No Docker container. The email arrives in under 3 seconds.

---

## Running locally

```bash
npm install
npx playwright install chromium
npm run dev
```

In a second terminal:

```bash
npx playwright test
```

A fresh inbox is generated automatically when `TEST_INBOX` is not set.

---

## Stack

- [Next.js](https://nextjs.org) — demo app
- [Playwright](https://playwright.dev) — E2E tests
- [zerodrop-client](https://npmjs.com/package/zerodrop-client) — disposable inbox SDK
- [zerodrop-dev/create-inbox](https://github.com/marketplace/actions/zerodrop-create-inbox) — GitHub Action

---

## Free tier

ZeroDrop's free tier uses a shared domain (`zerodrop-sandbox.online`) with AI spam filtering and 30-minute TTL. No signup required.

For custom domains, team seats, and API keys: [zerodrop.dev](https://zerodrop.dev)

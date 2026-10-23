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
  uses: zerodrop-dev/setup-zerodrop@aa882ace46b204bfd84bbcc374df73d32cf67343 # v1.1.0
  with:
    api-key: ${{ secrets.ZERODROP_API_KEY }}

- name: Run Playwright tests
  run: npx playwright test
  env:
    TEST_INBOX: ${{ steps.inbox.outputs.inbox }}
```

```typescript
// tests/auth.spec.ts

import { ZeroDrop } from 'zerodrop-client';

const mail = new ZeroDrop(); // reads ZERODROP_API_KEY
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

No mocking. No Docker container.

`api-key` is a free key from [zerodrop.dev/keys](https://zerodrop.dev/keys), stored as a repository secret. The inbox name then starts with your key's prefix and only your key can read it. The action also sets `ZERODROP_API_KEY` for the steps that follow, where `new ZeroDrop()` reads it.

---

## Running locally

```bash
npm install
npx playwright install chromium
cp .env.example .env
```

Fill in `.env` (the app and `playwright.config.ts` both read it):

- `RESEND_API_KEY` from [resend.com/api-keys](https://resend.com/api-keys).
- `RESEND_FROM`, an address on a domain you've verified at [resend.com/domains](https://resend.com/domains), such as `Auth <auth@yourdomain.com>`. Resend's shared `onboarding@resend.dev` only sends to your own Resend account's address, so it can't reach a ZeroDrop inbox.
- `ZERODROP_API_KEY`, a free key from [zerodrop.dev/keys](https://zerodrop.dev/keys) (sign in with GitHub). Without a key, one sender can reach only 5 different inboxes a day, and each test run uses a new inbox. With a key, inbox names start with your key's prefix, only your key can read them, and they aren't limited.

Then start the app:

```bash
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
- [zerodrop-dev/setup-zerodrop](https://github.com/marketplace/actions/setup-zerodrop) — GitHub Action

---

## Free tier

ZeroDrop's free tier uses a shared domain (`zerodrop-sandbox.online`) with a 30-minute TTL, and there's no signup to try it. Without an API key, one sender can reach only 5 different inboxes a day. A free key from [zerodrop.dev/keys](https://zerodrop.dev/keys) (sign in with GitHub) removes that limit for inboxes under your key's prefix, and only your key can read them.

For a custom domain and longer retention, see Workspaces at [zerodrop.dev/pricing](https://zerodrop.dev/pricing).

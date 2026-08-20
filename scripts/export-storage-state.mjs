/**
 * Export Playwright storageState from your live Brave session.
 *
 * Why this exists: Clerk's sign-in form requires a per-attempt email OTP for any
 * "new device", which Playwright headless contexts always are. The cleanest way
 * to skip the OTP is to reuse an existing trusted session — yours, in Brave.
 *
 * Steps:
 *   1. Open a terminal and run:
 *
 *        /opt/brave.com/brave/brave \
 *          --remote-debugging-port=9222 \
 *          --remote-allow-origins=* \
 *          --user-data-dir=/home/redmane/.config/BraveSoftware/Brave-Browser \
 *          about:blank
 *
 *      (Brave is already running. If the command fails because the profile is
 *      locked, close Brave first, run the command, then reopen Brave normally
 *      when you're done exporting.)
 *
 *   2. Verify DevTools is live:
 *        curl -s http://localhost:9222/json/version | head
 *
 *   3. In this directory:
 *        node scripts/export-storage-state.mjs
 *
 *      The script connects to your live Brave, opens a tab on
 *      https://ledgerix.vercel.app/dashboard, confirms you're already signed
 *      in (URL does not bounce to /sign-in), and saves cookies + localStorage
 *      to scripts/storageState.json.
 *
 *   4. Share the file path with your agent. They will reuse it for all 26
 *      captures; auth state survives the Playwright context that loads it.
 *
 * Re-run safely: deletes storageState.json before writing so stale state never
 * leaks into the next run.
 */
import { writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '../../../../../.agents/playwright-core/node_modules/playwright/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const STORAGE_STATE_PATH = resolve(HERE, 'storageState.json');
const BASE_URL = 'https://ledgerix.vercel.app';
const DASHBOARD_URL = `${BASE_URL}/dashboard`;
const CDP_URL = 'http://localhost:9222';

let browser;
try {
  browser = await chromium.connectOverCDP(CDP_URL);
} catch (err) {
  console.error(`Could not connect to Brave at ${CDP_URL}.`);
  console.error('Did you launch Brave with --remote-debugging-port=9222 ?');
  console.error('Original error:', err.message);
  process.exit(1);
}

const contexts = browser.contexts();
const context = contexts[0] ?? await browser.newContext();

const page = await context.newPage();
await page.goto(DASHBOARD_URL, { waitUntil: 'networkidle' });

if (page.url().startsWith(`${BASE_URL}/sign-in`)) {
  console.error('Not authenticated. Sign in to ledgerix.vercel.app in Brave first, then re-run.');
  process.exit(2);
}

console.log('Authenticated. URL:', page.url());

const storage = await context.storageState();
await writeFile(STORAGE_STATE_PATH, JSON.stringify(storage, null, 2));
console.log('Saved storageState to', STORAGE_STATE_PATH);

await page.close();
await browser.close();
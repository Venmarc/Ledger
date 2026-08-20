/**
 * Capture 26 mobile screenshots of Ledger — 13 routes × 2 themes (dark + light).
 *
 * Layout: 4 batches (2 themes × 2 auth states).
 *   - Public + logged-out: /sign-in, /sign-up — must be captured BEFORE loading
 *     the storageState, otherwise Clerk redirects to /dashboard for the
 *     authenticated user.
 *   - Protected + logged-in: the remaining 11 routes.
 *
 * Prerequisite: scripts/storageState.json from `export-storage-state.mjs`.
 *
 * Run in /home/redmane/Documents/Port-Sites/Category-5/Ledger:
 *   node scripts/capture-mobile-screenshots.mjs
 *
 * Output (overwrites any existing files):
 *   public/mobile-dark-{route}.png
 *   public/mobile-light-{route}.png
 *
 * Conventions:
 *   - Brave browser, incognito, no extensions (matches ~/.agents/playwright-core).
 *   - 375px viewport (iPhone SE / standard mobile breakpoint).
 *   - networkidle wait per route so async data has settled.
 *   - Theme toggled via localStorage['ledger-theme']; the inline script in
 *     app/layout.tsx reads this on first paint, so dark/light swap is immediate.
 */
import { chromium } from '../../../../../.agents/playwright-core/node_modules/playwright/index.mjs';
import { mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(HERE, '..');
const PUBLIC_DIR = resolve(PROJECT_ROOT, 'public');
const STORAGE_STATE_PATH = resolve(HERE, 'storageState.json');
const BASE_URL = 'https://ledgerix.vercel.app';

const PUBLIC_ROUTES = [
  { name: 'sign-in', path: '/sign-in' },
  { name: 'sign-up', path: '/sign-up' },
];

const PROTECTED_ROUTES = [
  { name: 'dashboard', path: '/dashboard' },
  { name: 'transactions', path: '/transactions' },
  // Sampled 2026-08-16 transaction (most recent at time of capture) and Washing Machine goal.
  { name: 'transaction-detail', path: '/transactions/a07b4f9e-8419-4535-91eb-a820c71e6636' },
  { name: 'budgets', path: '/budgets' },
  { name: 'goals', path: '/goals' },
  { name: 'goal-detail', path: '/goals/fc94f197-8b86-4147-b15c-1b1f34b21f13' },
  { name: 'analytics', path: '/analytics' },
  { name: 'recurring', path: '/recurring' },
  { name: 'settings', path: '/settings' },
  { name: 'settings-categories', path: '/settings/categories' },
  { name: 'landing', path: '/' },
];

const THEMES = ['dark', 'light'];

async function captureBatch(context, theme, routes) {
  // Set theme on every page navigation BEFORE the page's scripts run, so first
  // paint is already in the correct theme (matches the inline script in
  // app/layout.tsx reading localStorage synchronously).
  await context.addInitScript((t) => {
    try { window.localStorage.setItem('ledger-theme', t); } catch {}
  }, theme);

  const page = await context.newPage();
  for (const route of routes) {
    const url = `${BASE_URL}${route.path}`;
    const outPath = resolve(PUBLIC_DIR, `mobile-${theme}-${route.name}.png`);
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });
      await page.waitForTimeout(800);
      await page.screenshot({ path: outPath, fullPage: false });
      const finalUrl = page.url();
      const expectedPublic = route.name === 'sign-in' || route.name === 'sign-up';
      if (finalUrl.startsWith(`${BASE_URL}/sign-in`) && !expectedPublic) {
        console.warn(`[${theme}] ${route.name} redirected to ${finalUrl} — captured sign-in instead`);
      } else {
        console.log(`[${theme}] ${route.name} -> ${outPath}`);
      }
    } catch (err) {
      console.error(`[${theme}] ${route.name} FAILED: ${err.message}`);
    }
  }
  await page.close();
}

const browser = await chromium.launch({
  executablePath: '/opt/brave.com/brave/brave',
  args: ['--incognito', '--disable-extensions'],
  headless: true,
});

await mkdir(PUBLIC_DIR, { recursive: true });

// --- Batch 1+2: public routes, logged-out (no storageState) ---
for (const theme of THEMES) {
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  await captureBatch(context, theme, PUBLIC_ROUTES);
  await context.close();
}

// --- Batch 3+4: protected routes, logged-in (storageState loaded) ---
const authedContext = await browser.newContext({
  viewport: { width: 375, height: 812 },
  storageState: STORAGE_STATE_PATH,
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});
const probe = await authedContext.newPage();
await probe.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle', timeout: 30_000 });
if (probe.url().includes('/sign-in')) {
  console.error('Not authenticated. Re-export storageState.json (run scripts/export-storage-state.mjs).');
  await browser.close();
  process.exit(2);
}
console.log('Authenticated. URL:', probe.url());
await probe.close();

for (const theme of THEMES) {
  await captureBatch(authedContext, theme, PROTECTED_ROUTES);
}

await authedContext.close();
await browser.close();
console.log('Done. 26 screenshots written to public/.');
// Opens the main pages of the built site in a real browser and fails if any of them crashes.
// Run after `npm run build`, from Website/: node scripts/smoke-test.mjs
import { spawn } from 'node:child_process';
import { chromium } from 'playwright-core';

const PORT = 4173;
const BASE = `http://localhost:${PORT}`;
const ROUTES = [
  '/', '/notes', '/semester-1', '/semester-1/programming-in-c', '/electives',
  '/past-questions', '/past-questions/semester-1',
  '/syllabus', '/syllabus/semester-1', '/study-guides', '/study-guides/digital-logic',
  '/cgpa-calculator', '/pu-grading-system', '/pokhara-university',
  '/about', '/contributors', '/contributing', '/feedback', '/privacy',
];

const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' });
const stop = () => server.kill();

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(BASE)).ok) return;
    } catch {
      // Not up yet.
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('The built site did not start.');
}

const failures = [];
try {
  await waitForServer();
  const browser = await chromium.launch();
  for (const route of ROUTES) {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    try {
      await page.goto(BASE + route, { waitUntil: 'load', timeout: 30000 });
      // Let the app replace the static HTML and finish loading the page's code.
      await page.waitForTimeout(1200);
      await page.waitForFunction(() => !document.querySelector('.page-loading'), null, { timeout: 15000 });
      const text = await page.evaluate(() => document.querySelector('#root main')?.innerText.trim().length ?? 0);
      if (!text) errors.push('the page is blank');
      if (/^Page not found/.test(await page.title())) errors.push('the page shows "not found"');
    } catch (e) {
      errors.push(e.message.split('\n')[0]);
    }
    await page.close();
    console.log(`${errors.length ? 'FAIL' : 'ok  '}  ${route}${errors.length ? ` : ${errors.join('; ')}` : ''}`);
    if (errors.length) failures.push(route);
  }
  await browser.close();
} finally {
  stop();
}

if (failures.length) {
  console.error(`\n${failures.length} page(s) failed: ${failures.join(', ')}`);
  process.exit(1);
}
console.log(`\nAll ${ROUTES.length} pages opened without crashing.`);

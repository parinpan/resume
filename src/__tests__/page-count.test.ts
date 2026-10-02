import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawn, type ChildProcess } from 'node:child_process';
import path from 'node:path';
import puppeteer, { type Browser } from 'puppeteer';
import { PDFDocument } from 'pdf-lib';

/**
 * End-to-end PDF page-count verification.
 *
 * Unlike the rest of the suite (which runs in jsdom), this test boots a real
 * Next.js dev server and a headless Chromium via Puppeteer, then generates the
 * resume PDF exactly as the /api/pdf route does and asserts it fits within two
 * A4 pages.
 *
 * Because it depends on a real browser + server, the whole spec self-gates: if
 * either the server or Chromium fails to come up, the single test is skipped
 * rather than failing the suite (e.g. CI without a Chromium download).
 */

const PORT = 3999;
const URL = `http://localhost:${PORT}`;
const ROOT = path.resolve(__dirname, '../..');

let server: ChildProcess | undefined;
let browser: Browser | undefined;
let ready = false;

async function waitForServer(url: string, timeoutMs: number): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { method: 'GET' });
      if (res.ok) return true;
    } catch {
      // server not up yet
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

beforeAll(async () => {
  try {
    const nextBin = path.join(ROOT, 'node_modules', '.bin', 'next');
    server = spawn(nextBin, ['dev', '-p', String(PORT)], {
      cwd: ROOT,
      env: { ...process.env, PORT: String(PORT) },
      stdio: 'pipe',
    });

    // First request triggers an on-demand compile, so allow a generous window.
    const up = await waitForServer(URL, 90_000);
    if (!up) return;

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    });

    ready = true;
  } catch {
    ready = false;
  }
}, 120_000);

afterAll(async () => {
  if (browser) await browser.close();
  if (server) server.kill();
});

describe('PDF page count', () => {
  it('renders the resume as a PDF with no more than 2 pages', async (ctx) => {
    if (!ready || !browser) {
      ctx.skip();
      return;
    }

    const page = await browser.newPage();
    await page.goto(URL, { waitUntil: 'load' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: { top: '13mm', right: '13mm', bottom: '13mm', left: '13mm' },
      printBackground: true,
      displayHeaderFooter: false,
    });

    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pageCount = pdfDoc.getPageCount();

    expect(pageCount, `resume PDF rendered ${pageCount} pages (expected <= 2)`).toBeLessThanOrEqual(2);
  }, 60_000);
});

import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function GET() {
  const port = process.env.PORT || '3000';
  const url = `http://localhost:${port}`;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
  });

  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
      format: 'A4',
      margin: { top: '11.85mm', right: '15.5mm', bottom: '16.4mm', left: '15mm' },
      printBackground: true,
      displayHeaderFooter: false,
    });

    return new NextResponse(Buffer.from(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="Fachrin_Aulia_Nasution_Resume.pdf"',
      },
    });
  } finally {
    await browser.close();
  }
}

export const dynamic = 'force-dynamic';

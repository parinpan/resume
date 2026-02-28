import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { PDFDocument } from 'pdf-lib';
import resumeData from '../../../../resume-data.json';
import type { ResumeData, SkillItem } from '@/types/resume';

const DATA = resumeData as ResumeData;

function skillItemName(item: SkillItem): string {
  return typeof item === 'string' ? item : item.name;
}

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
    // 'load' waits for all resources (CSS, fonts, images) to finish loading.
    // Much faster than networkidle0 (no arbitrary 500ms timeout) while still
    // guaranteeing fonts are rendered before PDF generation.
    await page.goto(url, { waitUntil: 'load' });

    const rawPdf = await page.pdf({
      format: 'A4',
      margin: { top: '11.85mm', right: '15.5mm', bottom: '16.4mm', left: '15mm' },
      printBackground: true,
      displayHeaderFooter: false,
    });

    // Enrich PDF with metadata for ATS systems
    const pdfDoc = await PDFDocument.load(rawPdf);

    const profileSection = DATA.sections.find((s) => s.type === 'profile');
    const profileText = profileSection?.type === 'profile' ? profileSection.data : '';
    const subjectSummary = profileText.length > 200
      ? profileText.slice(0, 200) + '...'
      : profileText;

    const skillsSection = DATA.sections.find((s) => s.type === 'skills');
    const allSkillNames = skillsSection?.type === 'skills'
      ? skillsSection.data.flatMap((s) => s.items.map(skillItemName))
      : [];

    pdfDoc.setTitle(`Resume — ${DATA.name}`);
    pdfDoc.setAuthor(DATA.name);
    pdfDoc.setSubject(`${DATA.title} — ${subjectSummary}`);
    pdfDoc.setKeywords(allSkillNames);
    pdfDoc.setCreator(DATA.name);
    pdfDoc.setProducer('Puppeteer / pdf-lib');

    const enrichedPdf = await pdfDoc.save();

    return new NextResponse(Buffer.from(enrichedPdf), {
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

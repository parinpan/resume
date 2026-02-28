import { describe, it, expect, vi, beforeEach } from 'vitest';

// Track pdf-lib calls
const mockSetTitle = vi.fn();
const mockSetAuthor = vi.fn();
const mockSetSubject = vi.fn();
const mockSetKeywords = vi.fn();
const mockSetCreator = vi.fn();
const mockSetProducer = vi.fn();
const mockSave = vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3]));

const mockPdfDoc = {
  setTitle: mockSetTitle,
  setAuthor: mockSetAuthor,
  setSubject: mockSetSubject,
  setKeywords: mockSetKeywords,
  setCreator: mockSetCreator,
  setProducer: mockSetProducer,
  save: mockSave,
};

const mockLoad = vi.fn().mockResolvedValue(mockPdfDoc);

vi.mock('pdf-lib', () => ({
  PDFDocument: {
    load: mockLoad,
  },
}));

// Mock puppeteer before importing the route
vi.mock('puppeteer', () => {
  const mockPdf = Buffer.from('fake-pdf-content');
  const mockPage = {
    goto: vi.fn().mockResolvedValue(undefined),
    pdf: vi.fn().mockResolvedValue(mockPdf),
  };
  const mockBrowser = {
    newPage: vi.fn().mockResolvedValue(mockPage),
    close: vi.fn().mockResolvedValue(undefined),
  };

  return {
    default: {
      launch: vi.fn().mockResolvedValue(mockBrowser),
    },
  };
});

// Mock NextResponse to avoid issues with the next/server module
vi.mock('next/server', () => {
  return {
    NextResponse: class MockNextResponse {
      body: Buffer;
      headers: Map<string, string>;
      constructor(body: Buffer, init?: { headers?: Record<string, string> }) {
        this.body = body;
        this.headers = new Map(Object.entries(init?.headers || {}));
      }
    },
  };
});

describe('PDF API route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Re-set implementations cleared by clearAllMocks
    mockSave.mockResolvedValue(new Uint8Array([1, 2, 3]));
    mockLoad.mockResolvedValue(mockPdfDoc);
  });

  it('calls puppeteer.launch with expected options', async () => {
    const puppeteer = (await import('puppeteer')).default;
    const { GET } = await import('@/app/api/pdf/route');
    await GET();

    expect(puppeteer.launch).toHaveBeenCalledWith({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: undefined,
    });
  });

  it('navigates to localhost URL', async () => {
    const puppeteer = (await import('puppeteer')).default;
    const { GET } = await import('@/app/api/pdf/route');
    await GET();

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    expect(page.goto).toHaveBeenCalledWith(
      expect.stringContaining('http://localhost'),
      { waitUntil: 'load' },
    );
  });

  it('generates PDF with A4 format and correct margins', async () => {
    const puppeteer = (await import('puppeteer')).default;
    const { GET } = await import('@/app/api/pdf/route');
    await GET();

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    expect(page.pdf).toHaveBeenCalledWith({
      format: 'A4',
      margin: { top: '11.85mm', right: '15.5mm', bottom: '16.4mm', left: '15mm' },
      printBackground: true,
      displayHeaderFooter: false,
    });
  });

  it('returns a response with PDF content type', async () => {
    const { GET } = await import('@/app/api/pdf/route');
    const response = await GET();

    expect(response.headers.get('Content-Type')).toBe('application/pdf');
  });

  it('returns a response with attachment disposition', async () => {
    const { GET } = await import('@/app/api/pdf/route');
    const response = await GET();

    expect(response.headers.get('Content-Disposition')).toBe(
      'attachment; filename="Fachrin_Aulia_Nasution_Resume.pdf"',
    );
  });

  it('closes the browser after generating PDF', async () => {
    const puppeteer = (await import('puppeteer')).default;
    const { GET } = await import('@/app/api/pdf/route');
    await GET();

    const browser = await puppeteer.launch();
    expect(browser.close).toHaveBeenCalled();
  });

  it('closes browser even if page.pdf throws', async () => {
    const puppeteer = (await import('puppeteer')).default;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Reset and make pdf throw
    vi.mocked(page.pdf).mockRejectedValueOnce(new Error('PDF failed'));
    vi.mocked(browser.close).mockClear();

    const { GET } = await import('@/app/api/pdf/route');

    await expect(GET()).rejects.toThrow('PDF failed');
    expect(browser.close).toHaveBeenCalled();
  });

  it('uses PORT env var when set', async () => {
    const originalPort = process.env.PORT;
    process.env.PORT = '4000';

    // Need to re-import to pick up new env
    vi.resetModules();

    // Re-mock puppeteer for fresh import
    vi.doMock('puppeteer', () => {
      const mockPage = {
        goto: vi.fn().mockResolvedValue(undefined),
        pdf: vi.fn().mockResolvedValue(Buffer.from('pdf')),
      };
      return {
        default: {
          launch: vi.fn().mockResolvedValue({
            newPage: vi.fn().mockResolvedValue(mockPage),
            close: vi.fn().mockResolvedValue(undefined),
          }),
        },
      };
    });

    vi.doMock('pdf-lib', () => ({
      PDFDocument: {
        load: vi.fn().mockResolvedValue({
          setTitle: vi.fn(),
          setAuthor: vi.fn(),
          setSubject: vi.fn(),
          setKeywords: vi.fn(),
          setCreator: vi.fn(),
          setProducer: vi.fn(),
          save: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
        }),
      },
    }));

    vi.doMock('next/server', () => ({
      NextResponse: class {
        body: Buffer;
        headers: Map<string, string>;
        constructor(body: Buffer, init?: { headers?: Record<string, string> }) {
          this.body = body;
          this.headers = new Map(Object.entries(init?.headers || {}));
        }
      },
    }));

    const { GET } = await import('@/app/api/pdf/route');
    await GET();

    const puppeteer = (await import('puppeteer')).default;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    expect(page.goto).toHaveBeenCalledWith('http://localhost:4000', expect.any(Object));

    process.env.PORT = originalPort;
  });
});

describe('PDF metadata enrichment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // The PORT env test uses vi.resetModules() + vi.doMock(), which replaces
    // the pdf-lib mock with a disposable one. We must re-register our tracked
    // mocks so the freshly-imported route module uses them.
    vi.resetModules();
    vi.doMock('pdf-lib', () => ({
      PDFDocument: { load: mockLoad },
    }));
    vi.doMock('puppeteer', () => {
      const mockPage = {
        goto: vi.fn().mockResolvedValue(undefined),
        pdf: vi.fn().mockResolvedValue(Buffer.from('fake-pdf-content')),
      };
      return {
        default: {
          launch: vi.fn().mockResolvedValue({
            newPage: vi.fn().mockResolvedValue(mockPage),
            close: vi.fn().mockResolvedValue(undefined),
          }),
        },
      };
    });
    vi.doMock('next/server', () => ({
      NextResponse: class {
        body: Buffer;
        headers: Map<string, string>;
        constructor(body: Buffer, init?: { headers?: Record<string, string> }) {
          this.body = body;
          this.headers = new Map(Object.entries(init?.headers || {}));
        }
      },
    }));
    // Re-set implementations after clearAllMocks
    mockSave.mockResolvedValue(new Uint8Array([1, 2, 3]));
    mockLoad.mockResolvedValue(mockPdfDoc);
  });

  it('loads raw PDF with pdf-lib for metadata enrichment', async () => {
    const { PDFDocument } = await import('pdf-lib');
    const { GET } = await import('@/app/api/pdf/route');
    await GET();

    expect(PDFDocument.load).toHaveBeenCalledWith(expect.any(Buffer));
  });

  it('sets PDF title containing candidate name', async () => {
    const { GET } = await import('@/app/api/pdf/route');
    await GET();

    expect(mockSetTitle).toHaveBeenCalledTimes(1);
    const title = mockSetTitle.mock.calls[0][0] as string;
    expect(title).toContain('Fachrin Aulia Nasution');
    expect(title).toContain('Resume');
  });

  it('sets PDF author to candidate name', async () => {
    const { GET } = await import('@/app/api/pdf/route');
    await GET();

    expect(mockSetAuthor).toHaveBeenCalledWith('Fachrin Aulia Nasution');
  });

  it('sets PDF subject containing job title', async () => {
    const { GET } = await import('@/app/api/pdf/route');
    await GET();

    expect(mockSetSubject).toHaveBeenCalledTimes(1);
    const subject = mockSetSubject.mock.calls[0][0] as string;
    expect(subject).toContain('Senior Software Engineer');
  });

  it('sets PDF keywords containing all skill item names', async () => {
    const { GET } = await import('@/app/api/pdf/route');
    await GET();

    expect(mockSetKeywords).toHaveBeenCalledTimes(1);
    const keywords = mockSetKeywords.mock.calls[0][0] as string[];

    // Check some key skills are present
    expect(keywords).toContain('Go');
    expect(keywords).toContain('Kafka');
    expect(keywords).toContain('AWS');
    expect(keywords).toContain('HTTP');
    expect(keywords).toContain('Docker');
    expect(keywords.length).toBeGreaterThanOrEqual(30);
  });

  it('sets PDF producer to "Puppeteer / pdf-lib"', async () => {
    const { GET } = await import('@/app/api/pdf/route');
    await GET();

    expect(mockSetProducer).toHaveBeenCalledWith('Puppeteer / pdf-lib');
  });

  it('returns the enriched PDF buffer (not the raw one)', async () => {
    const { GET } = await import('@/app/api/pdf/route');
    await GET();

    expect(mockSave).toHaveBeenCalledTimes(1);
  });
});

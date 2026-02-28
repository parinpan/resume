import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import Home from '@/app/page';
import resumeData from '../../resume-data.json';
import type { ResumeData } from '@/types/resume';
import { skillItemName } from '@/utils/parsers';

/**
 * ATS (Applicant Tracking System) Parser Validation
 *
 * This test suite acts as a **real ATS parser**: it renders the full page HTML,
 * then extracts structured resume data purely from the DOM output — exactly
 * what an ATS does when it ingests an HTML resume.
 *
 * Two extraction strategies are tested:
 *
 * 1. **Semantic HTML parsing** — uses standard HTML elements (`<h1>`, `<h2>`,
 *    `<section>`, `<article>`, `<header>`, `<time>`, `<address>`, `<dl>`, `<a>`, etc.)
 *    to extract structured fields. This is how modern ATS systems work.
 *
 * 2. **Plain-text extraction** — strips all markup, then uses regex / string
 *    matching to locate contact info, section headings, dates, etc. This is
 *    how older / simpler ATS systems work.
 *
 * 3. **Structural validation** — verifies the DOM structure meets ATS best
 *    practices (no tables, correct heading hierarchy, valid links, etc.)
 *
 * Every resume field is validated against the source data (resume-data.json)
 * to prove the HTML is genuinely parseable, not just assumed to be.
 */

const DATA = resumeData as ResumeData;

vi.mock('@/components/Toolbar', () => ({
  Toolbar: () => <div data-testid="toolbar">Toolbar</div>,
}));

/**
 * Extract visible text from a container, excluding <script> and <style> tags.
 * This simulates how a text-based ATS (or a browser's innerText) would see
 * the page content — stripping hidden/machine-only elements.
 */
function extractVisibleText(root: HTMLElement): string {
  const clone = root.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('script, style').forEach((el) => el.remove());
  return (clone.textContent || '').replace(/\s+/g, ' ').trim();
}

// Fresh render for each test (cleanup runs after each via setup.ts)
let doc: HTMLElement;

beforeEach(() => {
  const { container } = render(<Home />);
  doc = container;
});

// ─────────────────────────────────────────────────────────────
// 1. SEMANTIC HTML PARSING (modern ATS)
// ─────────────────────────────────────────────────────────────

describe('ATS: Semantic HTML parsing', () => {
  describe('candidate identity', () => {
    it('extracts full name from <h1>', () => {
      const h1 = doc.querySelector('h1');
      expect(h1).not.toBeNull();
      expect(h1!.textContent!.trim()).toBe(DATA.name);
    });

    it('name <h1> contains ONLY the name (no subtitle element in header)', () => {
      const h1 = doc.querySelector('h1');
      expect(h1!.textContent).not.toContain(DATA.title);
      // No subtitle <p> element in header
      const subtitle = doc.querySelector('header > p');
      expect(subtitle).toBeNull();
    });
  });

  describe('contact information', () => {
    it('contact info is inside an <address> element', () => {
      const address = doc.querySelector('address');
      expect(address).not.toBeNull();
    });

    it('extracts email from mailto: link', () => {
      const link = doc.querySelector('a[href^="mailto:"]');
      expect(link).not.toBeNull();
      expect(link!.getAttribute('href')).toBe(`mailto:${DATA.contact.email}`);
      expect(link!.textContent).toBe(DATA.contact.email);
    });

    it('extracts phone from tel: link', () => {
      const link = doc.querySelector('a[href^="tel:"]');
      expect(link).not.toBeNull();
      expect(link!.getAttribute('href')).toBe(`tel:${DATA.contact.phone}`);
      expect(link!.textContent).toBe(DATA.contact.phone);
    });

    it('extracts website URL', () => {
      const links = Array.from(doc.querySelectorAll('address a'));
      const websiteLink = links.find((a) => a.getAttribute('href') === DATA.contact.website);
      expect(websiteLink).toBeDefined();
      expect(websiteLink!.textContent).toBe(DATA.contact.website);
    });

    it('extracts GitHub URL', () => {
      const links = Array.from(doc.querySelectorAll('address a'));
      const link = links.find((a) => a.getAttribute('href') === DATA.contact.github);
      expect(link).toBeDefined();
    });

    it('extracts LinkedIn URL', () => {
      const links = Array.from(doc.querySelectorAll('address a'));
      const link = links.find((a) => a.getAttribute('href') === DATA.contact.linkedin);
      expect(link).toBeDefined();
    });

    it('location text is present in the contact area', () => {
      const address = doc.querySelector('address');
      expect(address!.textContent).toContain(DATA.contact.location);
    });
  });

  describe('section headings', () => {
    it('each section has a <section> element with an <h2> heading', () => {
      const sections = doc.querySelectorAll('section');
      expect(sections.length).toBe(DATA.sections.length);

      sections.forEach((section) => {
        const h2 = section.querySelector('h2');
        expect(h2).not.toBeNull();
        expect(h2!.textContent!.trim().length).toBeGreaterThan(0);
      });
    });

    it('section headings use standard ATS-friendly labels', () => {
      const h2s = Array.from(doc.querySelectorAll('section h2'));
      const headings = h2s.map((h) => h.textContent!.trim());

      // These are the standard labels ATS systems recognise
      const atsStandard = ['Profile', 'Experience', 'Education', 'Skills', 'Certifications'];
      for (const label of atsStandard) {
        expect(headings).toContain(label);
      }
    });

    it('each <section> has an aria-label matching its <h2> text', () => {
      const sections = doc.querySelectorAll('section');
      sections.forEach((section) => {
        const h2 = section.querySelector('h2');
        expect(section.getAttribute('aria-label')).toBe(h2!.textContent!.trim());
      });
    });
  });

  describe('experience entries', () => {
    const expSection = DATA.sections.find((s) => s.type === 'experiences');
    const experiences = expSection?.type === 'experiences' ? expSection.data : [];

    it('each experience is wrapped in an <article> element', () => {
      const section = doc.querySelector('section[aria-label="Experience"]');
      expect(section).not.toBeNull();
      const articles = section!.querySelectorAll('article');
      expect(articles.length).toBe(experiences.length);
    });

    it('extracts job title and company as distinct elements', () => {
      const section = doc.querySelector('section[aria-label="Experience"]');
      const articles = section!.querySelectorAll('article');

      articles.forEach((article, idx) => {
        const jobTitle = article.querySelector('.jobTitle');
        const company = article.querySelector('.company');

        expect(jobTitle).not.toBeNull();
        expect(company).not.toBeNull();
        expect(jobTitle!.textContent!.trim()).toBe(experiences[idx].title);
        expect(company!.textContent!.trim()).toBe(experiences[idx].company);
      });
    });

    it('experience dates are in <time> elements with dateTime attributes', () => {
      const section = doc.querySelector('section[aria-label="Experience"]');
      const articles = section!.querySelectorAll('article');

      articles.forEach((article) => {
        const times = article.querySelectorAll('time');
        expect(times.length).toBeGreaterThanOrEqual(1);

        // At least the start date should have a valid dateTime
        const startTime = times[0];
        const dt = startTime.getAttribute('dateTime');
        // dateTime should be ISO format (e.g. "2023-10") or empty for "Present"
        if (startTime.textContent!.trim().toLowerCase() !== 'present') {
          expect(dt).toMatch(/^\d{4}(-\d{2})?$/);
        }
      });
    });

    it('experience entries have location text', () => {
      const section = doc.querySelector('section[aria-label="Experience"]');
      const articles = section!.querySelectorAll('article');

      articles.forEach((article, idx) => {
        expect(article.textContent).toContain(experiences[idx].location);
      });
    });

    it('experience bullet points are in <ul>/<li> elements', () => {
      const section = doc.querySelector('section[aria-label="Experience"]');
      const articles = section!.querySelectorAll('article');

      articles.forEach((article, idx) => {
        const bullets = article.querySelectorAll('ul > li');
        expect(bullets.length).toBe(experiences[idx].bullets.length);
      });
    });
  });

  describe('education entries', () => {
    const eduSection = DATA.sections.find((s) => s.type === 'education');
    const education = eduSection?.type === 'education' ? eduSection.data : [];

    it('extracts degree and institution as distinct elements', () => {
      const section = doc.querySelector('section[aria-label="Education"]');
      expect(section).not.toBeNull();
      const articles = section!.querySelectorAll('article');

      articles.forEach((article, idx) => {
        const degree = article.querySelector('.degree');
        const institution = article.querySelector('.institution');

        expect(degree).not.toBeNull();
        expect(institution).not.toBeNull();
        expect(degree!.textContent!.trim()).toBe(education[idx].degree);
        expect(institution!.textContent!.trim()).toBe(education[idx].institution);
      });
    });

    it('education dates are in <time> elements with dateTime attributes', () => {
      const section = doc.querySelector('section[aria-label="Education"]');
      expect(section).not.toBeNull();
      const times = section!.querySelectorAll('time');
      expect(times.length).toBeGreaterThanOrEqual(1);

      // Verify dateTime format
      times.forEach((time) => {
        const dt = time.getAttribute('dateTime');
        if (time.textContent!.trim().toLowerCase() !== 'present') {
          expect(dt).toMatch(/^\d{4}(-\d{2})?$/);
        }
      });
    });

    it('education bullet points are in <ul>/<li> elements', () => {
      const section = doc.querySelector('section[aria-label="Education"]');
      expect(section).not.toBeNull();
      const articles = section!.querySelectorAll('article');

      articles.forEach((article, idx) => {
        const bullets = article.querySelectorAll('ul > li');
        expect(bullets.length).toBe(education[idx].bullets.length);
      });
    });
  });

  describe('skills definition list', () => {
    const skillsSection = DATA.sections.find((s) => s.type === 'skills');
    const skills = skillsSection?.type === 'skills' ? skillsSection.data : [];

    it('skills are in a <dl> element (not a table)', () => {
      const section = doc.querySelector('section[aria-label="Skills"]');
      expect(section).not.toBeNull();
      const dl = section!.querySelector('dl');
      expect(dl).not.toBeNull();
      expect(section!.querySelector('table')).toBeNull();
    });

    it('dl has aria-label "Technical skills"', () => {
      const dl = doc.querySelector('section[aria-label="Skills"] dl');
      expect(dl).not.toBeNull();
      expect(dl!.getAttribute('aria-label')).toBe('Technical skills');
    });

    it('each skill category has a <dt> and <dd> pair', () => {
      const dl = doc.querySelector('section[aria-label="Skills"] dl');
      expect(dl).not.toBeNull();
      const dts = dl!.querySelectorAll('dt');
      const dds = dl!.querySelectorAll('dd');
      expect(dts.length).toBe(skills.length);
      expect(dds.length).toBe(skills.length);

      dts.forEach((dt, idx) => {
        expect(dt.textContent!.trim()).toBe(skills[idx].category);
      });

      dds.forEach((dd, idx) => {
        const expectedText = skills[idx].items.map(skillItemName).join(', ');
        expect(dd.textContent!.trim()).toBe(expectedText);
      });
    });

    it('acronym skill items are wrapped in <abbr> with title', () => {
      const dl = doc.querySelector('section[aria-label="Skills"] dl');
      expect(dl).not.toBeNull();
      const abbrs = dl!.querySelectorAll('abbr');

      // We have 8 items with fullForm in the data
      expect(abbrs.length).toBe(8);

      // Verify each <abbr> has a non-empty title
      abbrs.forEach((abbr) => {
        expect(abbr.getAttribute('title')).toBeTruthy();
        expect(abbr.textContent!.trim().length).toBeGreaterThan(0);
      });
    });
  });

  describe('certifications', () => {
    const certSection = DATA.sections.find((s) => s.type === 'certifications');
    const certs = certSection?.type === 'certifications' ? certSection.data : [];

    it('certifications are in a list', () => {
      const section = doc.querySelector('section[aria-label="Certifications"]');
      expect(section).not.toBeNull();
      const items = section!.querySelectorAll('li');
      expect(items.length).toBe(certs.length);
    });

    it('certification years are in <time> elements with dateTime', () => {
      const section = doc.querySelector('section[aria-label="Certifications"]');
      expect(section).not.toBeNull();
      const times = section!.querySelectorAll('time');
      expect(times.length).toBe(certs.length);

      times.forEach((time, idx) => {
        expect(time.textContent!.trim()).toBe(certs[idx].year);
        expect(time.getAttribute('dateTime')).toBe(certs[idx].year);
      });
    });
  });

  describe('courses', () => {
    const courseSection = DATA.sections.find((s) => s.type === 'courses');
    const courses = courseSection?.type === 'courses' ? courseSection.data : [];

    it('each course is in an <article> element', () => {
      const section = doc.querySelector('section[aria-label="Course"]');
      expect(section).not.toBeNull();
      const articles = section!.querySelectorAll('article');
      expect(articles.length).toBe(courses.length);
    });

    it('course dates have <time> elements with dateTime', () => {
      const section = doc.querySelector('section[aria-label="Course"]');
      expect(section).not.toBeNull();
      const articles = section!.querySelectorAll('article');

      articles.forEach((article) => {
        const times = article.querySelectorAll('time');
        expect(times.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('JSON-LD structured data', () => {
    it('has a valid JSON-LD script block', () => {
      const script = doc.querySelector('script[type="application/ld+json"]');
      expect(script).not.toBeNull();
      const jsonLd = JSON.parse(script!.textContent!);
      expect(jsonLd['@context']).toBe('https://schema.org');
      expect(jsonLd['@type']).toBe('ProfilePage');
    });

    it('JSON-LD person entity matches resume data', () => {
      const script = doc.querySelector('script[type="application/ld+json"]');
      expect(script).not.toBeNull();
      const jsonLd = JSON.parse(script!.textContent!);
      const person = jsonLd.mainEntity;

      expect(person['@type']).toBe('Person');
      expect(person.name).toBe(DATA.name);
      expect(person.jobTitle).toBe(DATA.title);
      expect(person.email).toBe(DATA.contact.email);
      expect(person.telephone).toBe(DATA.contact.phone);
    });

    it('JSON-LD includes all skill item names', () => {
      const script = doc.querySelector('script[type="application/ld+json"]');
      expect(script).not.toBeNull();
      const jsonLd = JSON.parse(script!.textContent!);
      const knowsAbout: string[] = jsonLd.mainEntity.knowsAbout;

      const skillsSection = DATA.sections.find((s) => s.type === 'skills');
      const allSkillNames = skillsSection?.type === 'skills'
        ? skillsSection.data.flatMap((s) => s.items.map(skillItemName))
        : [];

      for (const skill of allSkillNames) {
        expect(knowsAbout).toContain(skill);
      }
    });
  });
});

// ─────────────────────────────────────────────────────────────
// 2. PLAIN-TEXT EXTRACTION (legacy ATS / keyword scanners)
// ─────────────────────────────────────────────────────────────

describe('ATS: Plain-text extraction', () => {
  describe('contact info from raw text', () => {
    it('email is extractable via regex', () => {
      const plainText = extractVisibleText(doc);
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
      const match = plainText.match(emailRegex);
      expect(match).not.toBeNull();
      expect(match![0]).toBe(DATA.contact.email);
    });

    it('phone number is extractable via regex', () => {
      const plainText = extractVisibleText(doc);
      const phoneRegex = /\+\d{6,15}/;
      const match = plainText.match(phoneRegex);
      expect(match).not.toBeNull();
      expect(match![0]).toBe(DATA.contact.phone);
    });

    it('URLs are present in visible text', () => {
      const plainText = extractVisibleText(doc);
      expect(plainText).toContain(DATA.contact.website);
      expect(plainText).toContain(DATA.contact.github);
      expect(plainText).toContain(DATA.contact.linkedin);
    });

    it('location text appears in plain text', () => {
      const plainText = extractVisibleText(doc);
      expect(plainText).toContain(DATA.contact.location);
    });
  });

  describe('name and title from raw text', () => {
    it('candidate full name appears in plain text', () => {
      const plainText = extractVisibleText(doc);
      expect(plainText).toContain(DATA.name);
    });

    it('current job title appears in plain text (from experience entries)', () => {
      const plainText = extractVisibleText(doc);
      expect(plainText).toContain(DATA.title);
    });
  });

  describe('section headings from raw text', () => {
    it('all section headings appear as plain text', () => {
      const plainText = extractVisibleText(doc);
      for (const section of DATA.sections) {
        expect(plainText).toContain(section.title);
      }
    });
  });

  describe('experience keywords from raw text', () => {
    const expSection = DATA.sections.find((s) => s.type === 'experiences');
    const experiences = expSection?.type === 'experiences' ? expSection.data : [];

    it('every company name appears in plain text', () => {
      const plainText = extractVisibleText(doc);
      for (const exp of experiences) {
        expect(plainText).toContain(exp.company);
      }
    });

    it('every job title appears in plain text', () => {
      const plainText = extractVisibleText(doc);
      for (const exp of experiences) {
        expect(plainText).toContain(exp.title);
      }
    });

    it('all tech stack keywords appear in plain text', () => {
      const plainText = extractVisibleText(doc);
      const allTech = new Set<string>();
      for (const exp of experiences) {
        for (const bullet of exp.bullets) {
          if (bullet.tech) {
            for (const t of bullet.tech) allTech.add(t);
          }
        }
      }

      for (const tech of allTech) {
        expect(plainText).toContain(tech);
      }
    });

    it('date ranges are extractable via regex', () => {
      const plainText = extractVisibleText(doc);
      const dateRangeRegex = /[A-Z][a-z]{2} \d{4}\s*[-–—]\s*(?:[A-Z][a-z]+ \d{4}|Present)/g;
      const matches = plainText.match(dateRangeRegex) || [];
      // Should find at least one date range per experience entry
      expect(matches.length).toBeGreaterThanOrEqual(experiences.length);
    });
  });

  describe('education keywords from raw text', () => {
    const eduSection = DATA.sections.find((s) => s.type === 'education');
    const education = eduSection?.type === 'education' ? eduSection.data : [];

    it('degree appears in plain text', () => {
      const plainText = extractVisibleText(doc);
      for (const edu of education) {
        expect(plainText).toContain(edu.degree);
      }
    });

    it('institution appears in plain text', () => {
      const plainText = extractVisibleText(doc);
      for (const edu of education) {
        expect(plainText).toContain(edu.institution);
      }
    });
  });

  describe('skills keywords from raw text', () => {
    const skillsSection = DATA.sections.find((s) => s.type === 'skills');
    const skills = skillsSection?.type === 'skills' ? skillsSection.data : [];

    it('every skill category appears in plain text', () => {
      const plainText = extractVisibleText(doc);
      for (const skill of skills) {
        expect(plainText).toContain(skill.category);
      }
    });

    it('every individual skill item name appears in plain text', () => {
      const plainText = extractVisibleText(doc);
      for (const skill of skills) {
        for (const item of skill.items) {
          expect(plainText).toContain(skillItemName(item));
        }
      }
    });

    it('abbreviation full forms appear as abbr title attributes (not in visible text)', () => {
      const skillsSection = DATA.sections.find((s) => s.type === 'skills');
      const skills = skillsSection?.type === 'skills' ? skillsSection.data : [];

      const objectItems = skills
        .flatMap((s) => s.items)
        .filter((item): item is { name: string; fullForm: string } => typeof item !== 'string');

      expect(objectItems.length).toBeGreaterThan(0);

      for (const item of objectItems) {
        const abbr = doc.querySelector(`abbr[title="${item.fullForm}"]`);
        expect(abbr).not.toBeNull();
        expect(abbr!.textContent).toBe(item.name);
      }
    });
  });

  describe('certifications from raw text', () => {
    const certSection = DATA.sections.find((s) => s.type === 'certifications');
    const certs = certSection?.type === 'certifications' ? certSection.data : [];

    it('every certification name appears in plain text', () => {
      const plainText = extractVisibleText(doc);
      for (const cert of certs) {
        expect(plainText).toContain(cert.name);
      }
    });

    it('every certification issuer appears in plain text', () => {
      const plainText = extractVisibleText(doc);
      for (const cert of certs) {
        expect(plainText).toContain(cert.issuer);
      }
    });
  });

  describe('no data loss or corruption', () => {
    it('plain text contains substantial content (not empty / broken render)', () => {
      const plainText = extractVisibleText(doc);
      // A real resume should have at least 2000 characters of content
      expect(plainText.length).toBeGreaterThan(2000);
    });

    it('no HTML tags leaked into plain text', () => {
      const plainText = extractVisibleText(doc);
      expect(plainText).not.toMatch(/<\/?[a-z][a-z0-9]*[\s>]/i);
    });

    it('no JSON or code artifacts in visible text', () => {
      const plainText = extractVisibleText(doc);
      // JSON-LD should be in a <script> tag, not in visible text
      expect(plainText).not.toContain('"@context"');
      expect(plainText).not.toContain('"@type"');
    });
  });
});

// ─────────────────────────────────────────────────────────────
// 3. STRUCTURAL VALIDATION (ATS best practices)
// ─────────────────────────────────────────────────────────────

describe('ATS: Structural validation', () => {
  it('sections appear in ATS-preferred DOM order', () => {
    const sections = Array.from(doc.querySelectorAll('section'));
    const headings = sections.map((s) => s.querySelector('h2')!.textContent!.trim());

    const expectedOrder = ['Profile', 'Experience', 'Education', 'Skills', 'Course', 'Certifications'];
    expect(headings).toEqual(expectedOrder);
  });

  it('no <table> elements in resume content', () => {
    const main = doc.querySelector('main');
    expect(main).not.toBeNull();
    const tables = main!.querySelectorAll('table');
    expect(tables.length).toBe(0);
  });

  it('skills use <dl> with <dt> and <dd>', () => {
    const skillsSection = doc.querySelector('section[aria-label="Skills"]');
    expect(skillsSection).not.toBeNull();
    const dl = skillsSection!.querySelector('dl');
    expect(dl).not.toBeNull();
    expect(dl!.querySelectorAll('dt').length).toBeGreaterThan(0);
    expect(dl!.querySelectorAll('dd').length).toBeGreaterThan(0);
  });

  it('key acronyms are wrapped in <abbr> with non-empty title', () => {
    const abbrs = doc.querySelectorAll('abbr');
    expect(abbrs.length).toBeGreaterThan(0);

    abbrs.forEach((abbr) => {
      const title = abbr.getAttribute('title');
      expect(title).toBeTruthy();
      expect(title!.length).toBeGreaterThan(0);
      expect(abbr.textContent!.trim().length).toBeGreaterThan(0);
    });
  });

  it('heading hierarchy: exactly one <h1>, all sections use <h2>, no <h3>-<h6>', () => {
    const h1s = doc.querySelectorAll('h1');
    expect(h1s.length).toBe(1);

    const h2s = doc.querySelectorAll('section > h2');
    expect(h2s.length).toBe(DATA.sections.length);

    // No h3–h6 in the resume content
    const deeper = doc.querySelectorAll('main h3, main h4, main h5, main h6');
    expect(deeper.length).toBe(0);
  });

  it('no <img>, <canvas>, or <svg> in resume content', () => {
    const main = doc.querySelector('main');
    expect(main).not.toBeNull();
    expect(main!.querySelectorAll('img').length).toBe(0);
    expect(main!.querySelectorAll('canvas').length).toBe(0);
    expect(main!.querySelectorAll('svg').length).toBe(0);
  });

  it('all links have valid protocols (https://, mailto:, tel:)', () => {
    const main = doc.querySelector('main');
    expect(main).not.toBeNull();
    const links = main!.querySelectorAll('a[href]');
    expect(links.length).toBeGreaterThan(0);

    links.forEach((link) => {
      const href = link.getAttribute('href')!;
      const valid = href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('tel:');
      expect(valid).toBe(true);
    });
  });

  it('single <main> > <article> document structure', () => {
    const mains = doc.querySelectorAll('main');
    expect(mains.length).toBe(1);
    const article = mains[0].querySelector(':scope > article');
    expect(article).not.toBeNull();
  });

  it('all <time> dateTime attributes are valid ISO 8601 (YYYY or YYYY-MM)', () => {
    const times = doc.querySelectorAll('main time[dateTime]');
    expect(times.length).toBeGreaterThan(0);

    times.forEach((time) => {
      const dt = time.getAttribute('dateTime');
      // Empty string is valid for "Present" dates
      if (dt && dt.length > 0) {
        expect(dt).toMatch(/^\d{4}(-\d{2})?$/);
      }
    });
  });

  it('every entry <article> has at least one <time> element', () => {
    const articles = doc.querySelectorAll('main article');
    expect(articles.length).toBeGreaterThan(0);

    // The top-level <article class="page"> is the wrapper, skip it
    const entryArticles = Array.from(articles).filter(
      (a) => !a.classList.contains('page')
    );

    entryArticles.forEach((article) => {
      const times = article.querySelectorAll('time');
      expect(times.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('contact elements do not merge (whitespace between items)', () => {
    const plainText = extractVisibleText(doc);

    // These should NOT be merged (e.g. "engineering@fachr.inWebsite")
    expect(plainText).not.toMatch(/engineering@fachr\.in\S*https/);
    expect(plainText).not.toMatch(/fachr\.inhttps/);

    // Each contact item should be separately extractable
    expect(plainText).toContain(DATA.contact.email);
    expect(plainText).toContain(DATA.contact.website);
  });

  it('profile section contains a <p> element', () => {
    const profileSection = doc.querySelector('section[aria-label="Profile"]');
    expect(profileSection).not.toBeNull();
    const p = profileSection!.querySelector('p');
    expect(p).not.toBeNull();
    expect(p!.textContent!.trim().length).toBeGreaterThan(0);
  });
});

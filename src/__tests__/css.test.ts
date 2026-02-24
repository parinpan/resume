import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * These tests validate the CSS files to ensure responsive breakpoints,
 * CSS custom properties, and critical layout rules are consistent.
 */

const ROOT = path.resolve(__dirname, '..');

function readCSS(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf-8');
}

describe('CSS breakpoints consistency', () => {
  const cssFiles = [
    'app/globals.css',
    'app/page.module.css',
    'components/Section.module.css',
    'components/Skills.module.css',
    'components/Entry.module.css',
    'components/Header.module.css',
  ];

  const MOBILE_BREAKPOINT = '1200px';

  for (const file of cssFiles) {
    it(`${file} uses ${MOBILE_BREAKPOINT} mobile breakpoint`, () => {
      const css = readCSS(file);
      const breakpoints = css.match(/max-width:\s*(\d+px)/g);
      expect(breakpoints).not.toBeNull();
      for (const bp of breakpoints!) {
        const value = bp.match(/max-width:\s*(\d+px)/)![1];
        // The only allowed screen breakpoints are 1200px and 520px (toolbar)
        expect(['1200px', '520px']).toContain(value);
      }
    });
  }

  it('Toolbar.module.css uses 520px breakpoint for small mobile', () => {
    const css = readCSS('components/Toolbar.module.css');
    expect(css).toContain('max-width: 520px');
  });
});

describe('CSS custom properties', () => {
  const css = readCSS('app/globals.css');

  it('defines all font size variables in :root', () => {
    expect(css).toMatch(/--sz-name:\s*13pt/);
    expect(css).toMatch(/--sz-section:\s*11pt/);
    expect(css).toMatch(/--sz-entry:\s*9\.5pt/);
    expect(css).toMatch(/--sz-body:\s*8\.5pt/);
    expect(css).toMatch(/--lh:\s*1\.44/);
  });

  it('overrides font sizes in mobile breakpoint with px values', () => {
    expect(css).toMatch(/--sz-name:\s*24px/);
    expect(css).toMatch(/--sz-section:\s*20px/);
    expect(css).toMatch(/--sz-entry:\s*17px/);
    expect(css).toMatch(/--sz-body:\s*16px/);
  });

  it('increases line-height in mobile', () => {
    // There should be --lh: 1.5 inside the media query
    const mobileBlock = css.split('max-width: 1200px')[1];
    expect(mobileBlock).toMatch(/--lh:\s*1\.5/);
  });
});

describe('page shell layout', () => {
  const css = readCSS('app/globals.css');

  it('sets A4 width (210mm) for desktop', () => {
    expect(css).toMatch(/\.page\s*\{[^}]*width:\s*210mm/);
  });

  it('sets A4 min-height (297mm) for desktop', () => {
    expect(css).toMatch(/min-height:\s*297mm/);
  });

  it('has responsive zoom formula', () => {
    expect(css).toContain('zoom: min(1.35, calc((100vw - 32px) / 210mm))');
  });

  it('sets zoom to 1 in mobile', () => {
    const mobileBlock = css.split('max-width: 1200px')[1]?.split('}')[2];
    expect(mobileBlock).toContain('zoom: 1');
  });

  it('sets width: 100% in mobile', () => {
    const mobileSection = css.split('max-width: 1200px')[1];
    expect(mobileSection).toContain('width: 100%');
  });

  it('removes box-shadow in mobile', () => {
    const mobileSection = css.split('max-width: 1200px')[1];
    expect(mobileSection).toContain('box-shadow: none');
  });
});

describe('print styles', () => {
  const css = readCSS('app/globals.css');

  it('has @media print block', () => {
    expect(css).toContain('@media print');
  });

  it('sets zoom to 1 for print', () => {
    const printBlock = css.split('@media print')[1];
    expect(printBlock).toContain('zoom: 1');
  });

  it('sets display block for print (fragmentation)', () => {
    const printBlock = css.split('@media print')[1];
    expect(printBlock).toContain('display: block');
  });

  it('has @page rule with A4 size', () => {
    expect(css).toContain('size: A4');
  });

  it('print does not override font size variables', () => {
    const printBlock = css.split('@media print')[1];
    expect(printBlock).not.toContain('--sz-name');
    expect(printBlock).not.toContain('--sz-body');
  });
});

describe('component CSS modules', () => {
  it('Entry.module.css has print-specific bullet padding', () => {
    const css = readCSS('components/Entry.module.css');
    expect(css).toContain('@media print');
    const printBlock = css.split('@media print')[1];
    expect(printBlock).toContain('padding-left: 11pt');
  });

  it('Skills.module.css uses --sz-body for font size', () => {
    const css = readCSS('components/Skills.module.css');
    expect(css).toContain('font-size: var(--sz-body)');
  });

  it('Header.module.css uses --sz-name for name', () => {
    const css = readCSS('components/Header.module.css');
    expect(css).toContain('font-size: var(--sz-name)');
  });

  it('Header.module.css hides separators in mobile', () => {
    const css = readCSS('components/Header.module.css');
    const mobileBlock = css.split('max-width: 1200px')[1];
    expect(mobileBlock).toContain('display: none');
  });

  it('Section.module.css uses --sz-section for title', () => {
    const css = readCSS('components/Section.module.css');
    expect(css).toContain('font-size: var(--sz-section)');
  });

  it('Entry.module.css uses --sz-entry for entry elements', () => {
    const css = readCSS('components/Entry.module.css');
    expect(css).toContain('font-size: var(--sz-entry)');
  });

  it('Entry.module.css stacks entry header in mobile', () => {
    const css = readCSS('components/Entry.module.css');
    const mobileBlock = css.split('max-width: 1200px')[1];
    expect(mobileBlock).toContain('flex-direction: column');
  });
});

describe('mobile spacing', () => {
  it('page has adequate padding in mobile', () => {
    const css = readCSS('app/globals.css');
    const mobileBlock = css.split('max-width: 1200px')[1];
    expect(mobileBlock).toMatch(/padding:\s*32px 28px 80px/);
  });

  it('sections have increased margin in mobile', () => {
    const css = readCSS('components/Section.module.css');
    const mobileBlock = css.split('max-width: 1200px')[1];
    expect(mobileBlock).toMatch(/margin-top:\s*36px/);
  });

  it('header has increased padding in mobile', () => {
    const css = readCSS('components/Header.module.css');
    const mobileBlock = css.split('max-width: 1200px')[1];
    expect(mobileBlock).toMatch(/padding-bottom:\s*20px/);
  });

  it('bullet items have margin-bottom in mobile', () => {
    const css = readCSS('components/Entry.module.css');
    const mobileBlock = css.split('max-width: 1200px')[1];
    expect(mobileBlock).toMatch(/margin-bottom:\s*8px/);
  });
});

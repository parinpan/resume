import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

// Mock the Toolbar since it's a client component
vi.mock('@/components/Toolbar', () => ({
  Toolbar: () => <div data-testid="toolbar">Toolbar</div>,
}));

describe('Home page', () => {
  it('renders without crashing', () => {
    render(<Home />);
  });

  it('renders the name in an h1', () => {
    render(<Home />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading.textContent).toContain('Fachrin Aulia Nasution');
  });

  it('does not render a subtitle in the header', () => {
    const { container } = render(<Home />);
    const subtitle = container.querySelector('header > p');
    expect(subtitle).not.toBeInTheDocument();
  });

  it('renders the Toolbar', () => {
    render(<Home />);
    expect(screen.getByTestId('toolbar')).toBeInTheDocument();
  });

  it('renders a main element', () => {
    render(<Home />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('renders the page article with id="page"', () => {
    const { container } = render(<Home />);
    const article = container.querySelector('article#page');
    expect(article).toBeInTheDocument();
    expect(article?.classList.contains('page')).toBe(true);
  });

  it('renders JSON-LD structured data', () => {
    const { container } = render(<Home />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).toBeInTheDocument();
    const jsonLd = JSON.parse(script!.textContent!);
    expect(jsonLd['@context']).toBe('https://schema.org');
    expect(jsonLd['@type']).toBe('ProfilePage');
    expect(jsonLd.mainEntity['@type']).toBe('Person');
    expect(jsonLd.mainEntity.name).toBe('Fachrin Aulia Nasution');
  });

  it('JSON-LD includes current employer in worksFor', () => {
    const { container } = render(<Home />);
    const script = container.querySelector('script[type="application/ld+json"]');
    const jsonLd = JSON.parse(script!.textContent!);
    expect(jsonLd.mainEntity.worksFor).toBeDefined();
    expect(jsonLd.mainEntity.worksFor['@type']).toBe('Organization');
    expect(jsonLd.mainEntity.worksFor.name).toBe('Upvest');
  });

  it('JSON-LD includes skills', () => {
    const { container } = render(<Home />);
    const script = container.querySelector('script[type="application/ld+json"]');
    const jsonLd = JSON.parse(script!.textContent!);
    expect(Array.isArray(jsonLd.mainEntity.knowsAbout)).toBe(true);
    expect(jsonLd.mainEntity.knowsAbout.length).toBeGreaterThan(0);
    expect(jsonLd.mainEntity.knowsAbout).toContain('Go');
  });

  it('JSON-LD includes alumni and credentials', () => {
    const { container } = render(<Home />);
    const script = container.querySelector('script[type="application/ld+json"]');
    const jsonLd = JSON.parse(script!.textContent!);
    expect(Array.isArray(jsonLd.mainEntity.alumniOf)).toBe(true);
    expect(jsonLd.mainEntity.alumniOf.length).toBeGreaterThan(0);
    expect(Array.isArray(jsonLd.mainEntity.hasCredential)).toBe(true);
    expect(jsonLd.mainEntity.hasCredential.length).toBeGreaterThan(0);
  });

  it('JSON-LD includes sameAs with social links', () => {
    const { container } = render(<Home />);
    const script = container.querySelector('script[type="application/ld+json"]');
    const jsonLd = JSON.parse(script!.textContent!);
    expect(jsonLd.mainEntity.sameAs).toContain('https://github.com/parinpan');
    expect(jsonLd.mainEntity.sameAs).toContain('https://linkedin.com/in/fachrinfan');
  });

  it('JSON-LD includes contact info', () => {
    const { container } = render(<Home />);
    const script = container.querySelector('script[type="application/ld+json"]');
    const jsonLd = JSON.parse(script!.textContent!);
    expect(jsonLd.mainEntity.email).toBe('engineering@fachr.in');
    expect(jsonLd.mainEntity.telephone).toBe('+491639860973');
    expect(jsonLd.mainEntity.address.addressLocality).toBe('Berlin');
    expect(jsonLd.mainEntity.address.addressCountry).toBe('Germany');
  });

  describe('sections rendering', () => {
    it('renders the Profile section', () => {
      render(<Home />);
      expect(screen.getByRole('region', { name: 'Profile' })).toBeInTheDocument();
      expect(screen.getByText(/seasoned software engineer/i)).toBeInTheDocument();
    });

    it('renders the Experience section', () => {
      render(<Home />);
      expect(screen.getByRole('region', { name: 'Experience' })).toBeInTheDocument();
    });

    it('renders all experience entries', () => {
      render(<Home />);
      expect(screen.getAllByText(/Upvest/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Choco/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Delivery Hero/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Gojek/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Tokopedia/).length).toBeGreaterThan(0);
    });

    it('renders the Education section', () => {
      render(<Home />);
      expect(screen.getByRole('region', { name: 'Education' })).toBeInTheDocument();
      expect(screen.getByText(/University of Sumatera Utara/)).toBeInTheDocument();
    });

    it('renders the Skills section', () => {
      const { container } = render(<Home />);
      expect(screen.getByRole('region', { name: 'Skills' })).toBeInTheDocument();
      const dl = container.querySelector('dl[aria-label="Technical skills"]');
      expect(dl).toBeInTheDocument();
    });

    it('renders the Course section', () => {
      render(<Home />);
      expect(screen.getByRole('region', { name: 'Course' })).toBeInTheDocument();
      expect(screen.getByText(/Young Entrepreneurs Academy/)).toBeInTheDocument();
    });

    it('renders the Certifications section', () => {
      render(<Home />);
      expect(screen.getByRole('region', { name: 'Certifications' })).toBeInTheDocument();
      expect(screen.getByText(/Software Development Fundamentals/)).toBeInTheDocument();
    });

    it('renders all 6 section headings', () => {
      render(<Home />);
      const headings = screen.getAllByRole('heading', { level: 2 });
      expect(headings.length).toBe(6);
      const titles = headings.map((h) => h.textContent);
      expect(titles).toContain('Profile');
      expect(titles).toContain('Experience');
      expect(titles).toContain('Education');
      expect(titles).toContain('Skills');
      expect(titles).toContain('Course');
      expect(titles).toContain('Certifications');
    });
  });
});

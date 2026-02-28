import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SkillsTable } from '@/components/SkillsTable';
import type { Skill } from '@/types/resume';

const mockSkills: Skill[] = [
  { category: 'Programming Languages', items: ['Go', 'Python', 'TypeScript'] },
  { category: 'Databases', items: ['PostgreSQL', 'Redis'] },
];

const mockSkillsWithAbbr: Skill[] = [
  {
    category: 'Protocols',
    items: [
      { name: 'HTTP', fullForm: 'Hypertext Transfer Protocol' },
      'Twirp',
      { name: 'gRPC', fullForm: 'gRPC Remote Procedure Calls' },
    ],
  },
];

describe('SkillsTable', () => {
  it('renders a <dl> element', () => {
    const { container } = render(<SkillsTable data={mockSkills} />);
    expect(container.querySelector('dl')).toBeInTheDocument();
  });

  it('has the aria-label "Technical skills"', () => {
    const { container } = render(<SkillsTable data={mockSkills} />);
    const dl = container.querySelector('dl');
    expect(dl!.getAttribute('aria-label')).toBe('Technical skills');
  });

  it('renders a <dt>/<dd> pair for each skill category', () => {
    const { container } = render(<SkillsTable data={mockSkills} />);
    const dts = container.querySelectorAll('dt');
    const dds = container.querySelectorAll('dd');
    expect(dts.length).toBe(2);
    expect(dds.length).toBe(2);
  });

  it('renders the category name in <dt>', () => {
    render(<SkillsTable data={mockSkills} />);
    expect(screen.getByText('Programming Languages')).toBeInTheDocument();
    expect(screen.getByText('Databases')).toBeInTheDocument();
  });

  it('renders items joined by comma and space in <dd>', () => {
    const { container } = render(<SkillsTable data={mockSkills} />);
    const dds = container.querySelectorAll('dd');
    expect(dds[0].textContent).toBe('Go, Python, TypeScript');
    expect(dds[1].textContent).toBe('PostgreSQL, Redis');
  });

  it('does not render any <table> elements', () => {
    const { container } = render(<SkillsTable data={mockSkills} />);
    expect(container.querySelector('table')).toBeNull();
  });

  it('handles a single skill', () => {
    const single: Skill[] = [{ category: 'Tools', items: ['Git'] }];
    render(<SkillsTable data={single} />);
    expect(screen.getByText('Tools')).toBeInTheDocument();
    expect(screen.getByText('Git')).toBeInTheDocument();
  });

  it('handles empty data array', () => {
    const { container } = render(<SkillsTable data={[]} />);
    expect(container.querySelector('dl')).toBeInTheDocument();
    expect(container.querySelectorAll('dt').length).toBe(0);
  });

  describe('abbreviation support', () => {
    it('renders object items as <abbr> with title attribute', () => {
      const { container } = render(<SkillsTable data={mockSkillsWithAbbr} />);
      const abbrs = container.querySelectorAll('abbr');
      expect(abbrs.length).toBe(2);

      const httpAbbr = abbrs[0];
      expect(httpAbbr.textContent).toBe('HTTP');
      expect(httpAbbr.getAttribute('title')).toBe('Hypertext Transfer Protocol');

      const grpcAbbr = abbrs[1];
      expect(grpcAbbr.textContent).toBe('gRPC');
      expect(grpcAbbr.getAttribute('title')).toBe('gRPC Remote Procedure Calls');
    });

    it('renders plain string items without <abbr>', () => {
      const { container } = render(<SkillsTable data={mockSkillsWithAbbr} />);
      // "Twirp" should be a plain span, not an <abbr>
      expect(screen.getByText('Twirp')).toBeInTheDocument();
      const twirpEl = screen.getByText('Twirp');
      expect(twirpEl.tagName).not.toBe('ABBR');
    });

    it('mixes plain strings and abbr items in same row', () => {
      const { container } = render(<SkillsTable data={mockSkillsWithAbbr} />);
      const dd = container.querySelector('dd');
      expect(dd!.textContent).toBe('HTTP, Twirp, gRPC');
    });
  });
});

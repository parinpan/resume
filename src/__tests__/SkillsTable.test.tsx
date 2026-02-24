import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SkillsTable } from '@/components/SkillsTable';
import type { Skill } from '@/types/resume';

const mockSkills: Skill[] = [
  { category: 'Programming Languages', items: ['Go', 'Python', 'TypeScript'] },
  { category: 'Databases', items: ['PostgreSQL', 'Redis'] },
];

describe('SkillsTable', () => {
  it('renders a table element', () => {
    render(<SkillsTable data={mockSkills} />);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('has the aria-label "Technical skills"', () => {
    render(<SkillsTable data={mockSkills} />);
    expect(screen.getByRole('table', { name: 'Technical skills' })).toBeInTheDocument();
  });

  it('renders a row for each skill category', () => {
    render(<SkillsTable data={mockSkills} />);
    const rows = screen.getAllByRole('row');
    expect(rows.length).toBe(2);
  });

  it('renders the category name in the first cell', () => {
    render(<SkillsTable data={mockSkills} />);
    expect(screen.getByText('Programming Languages')).toBeInTheDocument();
    expect(screen.getByText('Databases')).toBeInTheDocument();
  });

  it('renders items joined by comma and space', () => {
    render(<SkillsTable data={mockSkills} />);
    expect(screen.getByText('Go, Python, TypeScript')).toBeInTheDocument();
    expect(screen.getByText('PostgreSQL, Redis')).toBeInTheDocument();
  });

  it('renders inside a tbody', () => {
    const { container } = render(<SkillsTable data={mockSkills} />);
    expect(container.querySelector('tbody')).toBeInTheDocument();
    expect(container.querySelectorAll('tbody tr').length).toBe(2);
  });

  it('each row has exactly two cells', () => {
    const { container } = render(<SkillsTable data={mockSkills} />);
    const rows = container.querySelectorAll('tr');
    for (const row of rows) {
      expect(row.querySelectorAll('td').length).toBe(2);
    }
  });

  it('handles a single skill', () => {
    const single: Skill[] = [{ category: 'Tools', items: ['Git'] }];
    render(<SkillsTable data={single} />);
    expect(screen.getByText('Tools')).toBeInTheDocument();
    expect(screen.getByText('Git')).toBeInTheDocument();
  });

  it('handles empty data array', () => {
    const { container } = render(<SkillsTable data={[]} />);
    expect(container.querySelector('table')).toBeInTheDocument();
    expect(container.querySelectorAll('tr').length).toBe(0);
  });
});

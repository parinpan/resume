import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EducationEntry } from '@/components/EducationEntry';
import type { Education } from '@/types/resume';

const baseEducation: Education = {
  degree: 'Bachelor of Computer Science',
  institution: 'MIT',
  location: 'Cambridge, USA',
  period: 'Sep 2014 - Apr 2019',
  bullets: [
    'Grade Point Average: 3.73 out of 4',
    'Built a system: https://example.com',
  ],
};

describe('EducationEntry', () => {
  it('renders the degree and institution', () => {
    render(<EducationEntry data={baseEducation} />);
    expect(screen.getByText(/Bachelor of Computer Science/)).toBeInTheDocument();
    expect(screen.getByText(/MIT/)).toBeInTheDocument();
  });

  it('renders the location', () => {
    render(<EducationEntry data={baseEducation} />);
    expect(screen.getByText(/Cambridge, USA/)).toBeInTheDocument();
  });

  it('renders the period in a time element', () => {
    const { container } = render(<EducationEntry data={baseEducation} />);
    const time = container.querySelector('time');
    expect(time).toBeInTheDocument();
    expect(time?.textContent).toBe('Sep 2014 - Apr 2019');
  });

  it('renders bullet points', () => {
    render(<EducationEntry data={baseEducation} />);
    expect(screen.getByText(/Grade Point Average/)).toBeInTheDocument();
  });

  it('converts URLs in bullets to links via parseLinks', () => {
    render(<EducationEntry data={baseEducation} />);
    const link = screen.getByRole('link', { name: 'https://example.com' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('renders as an article element', () => {
    render(<EducationEntry data={baseEducation} />);
    expect(screen.getByRole('article')).toBeInTheDocument();
  });

  it('renders all bullets as list items', () => {
    render(<EducationEntry data={baseEducation} />);
    const items = screen.getAllByRole('listitem');
    expect(items.length).toBe(2);
  });

  it('handles education with no bullets', () => {
    const data: Education = { ...baseEducation, bullets: [] };
    const { container } = render(<EducationEntry data={data} />);
    expect(container.querySelector('ul')).toBeInTheDocument();
    expect(screen.queryAllByRole('listitem').length).toBe(0);
  });
});

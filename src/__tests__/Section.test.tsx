import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Section } from '@/components/Section';

describe('Section', () => {
  it('renders the title as an h2', () => {
    render(<Section title="Experience"><p>Content</p></Section>);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading.textContent).toBe('Experience');
  });

  it('renders children content', () => {
    render(<Section title="Skills"><p>React, TypeScript</p></Section>);
    expect(screen.getByText('React, TypeScript')).toBeInTheDocument();
  });

  it('wraps content in a section element with aria-label', () => {
    render(<Section title="Profile"><p>Hello</p></Section>);
    const section = screen.getByRole('region', { name: 'Profile' });
    expect(section).toBeInTheDocument();
  });

  it('renders multiple children', () => {
    render(
      <Section title="Test">
        <p>First</p>
        <p>Second</p>
        <p>Third</p>
      </Section>,
    );
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(screen.getByText('Third')).toBeInTheDocument();
  });
});

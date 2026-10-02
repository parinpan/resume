import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CertificationsList } from '@/components/CertificationsList';
import type { Certification } from '@/types/resume';

const mockCerts: Certification[] = [
  { name: 'AWS Solutions Architect', issuer: 'Amazon', year: '2023' },
  { name: 'CKA', issuer: 'CNCF', year: '2022' },
];

describe('CertificationsList', () => {
  it('renders all certifications', () => {
    render(<CertificationsList data={mockCerts} />);
    expect(screen.getByText(/AWS Solutions Architect/)).toBeInTheDocument();
    expect(screen.getByText(/CKA/)).toBeInTheDocument();
  });

  it('renders cert name and issuer together', () => {
    render(<CertificationsList data={mockCerts} />);
    expect(screen.getByText(/AWS Solutions Architect, Amazon/)).toBeInTheDocument();
    expect(screen.getByText(/CKA, CNCF/)).toBeInTheDocument();
  });

  it('renders the year in a time element', () => {
    const { container } = render(<CertificationsList data={mockCerts} />);
    const times = container.querySelectorAll('time');
    expect(times.length).toBe(2);
    expect(times[0].textContent).toBe('2023');
    expect(times[1].textContent).toBe('2022');
  });

  it('renders as a ul with li items', () => {
    render(<CertificationsList data={mockCerts} />);
    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();
    const items = screen.getAllByRole('listitem');
    expect(items.length).toBe(2);
  });

  it('renders cert names in bold', () => {
    const { container } = render(<CertificationsList data={mockCerts} />);
    const strongs = container.querySelectorAll('strong');
    expect(strongs.length).toBe(2);
  });

  it('handles empty array', () => {
    render(<CertificationsList data={[]} />);
    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();
    expect(screen.queryAllByRole('listitem').length).toBe(0);
  });

  it('handles single certification', () => {
    const single: Certification[] = [{ name: 'Test Cert', issuer: 'Test Org', year: '2020' }];
    render(<CertificationsList data={single} />);
    expect(screen.getByText(/Test Cert, Test Org/)).toBeInTheDocument();
    expect(screen.getAllByRole('listitem').length).toBe(1);
  });
});

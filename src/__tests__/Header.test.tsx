import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from '@/components/Header';
import type { Contact } from '@/types/resume';

const mockContact: Contact = {
  location: 'Berlin, Germany',
  phone: '+491234567890',
  email: 'test@example.com',
  website: 'https://example.com',
  github: 'https://github.com/testuser',
  linkedin: 'https://linkedin.com/in/testuser',
};

describe('Header', () => {
  it('renders the name and title in an h1', () => {
    render(<Header name="John Doe" title="Software Engineer" contact={mockContact} />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading.textContent).toContain('John Doe');
    expect(heading.textContent).toContain('Software Engineer');
  });

  it('renders within a header element', () => {
    render(<Header name="John Doe" title="Software Engineer" contact={mockContact} />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('renders the location', () => {
    render(<Header name="John Doe" title="Software Engineer" contact={mockContact} />);
    expect(screen.getByText(/Berlin, Germany/)).toBeInTheDocument();
  });

  it('renders the phone number as a tel: link', () => {
    render(<Header name="John Doe" title="Software Engineer" contact={mockContact} />);
    const telLink = screen.getByRole('link', { name: '+491234567890' });
    expect(telLink).toBeInTheDocument();
    expect(telLink).toHaveAttribute('href', 'tel:+491234567890');
  });

  it('renders the email as a mailto: link', () => {
    render(<Header name="John Doe" title="Software Engineer" contact={mockContact} />);
    const emailLink = screen.getByRole('link', { name: 'test@example.com' });
    expect(emailLink).toBeInTheDocument();
    expect(emailLink).toHaveAttribute('href', 'mailto:test@example.com');
  });

  it('renders website link', () => {
    render(<Header name="John Doe" title="Software Engineer" contact={mockContact} />);
    const link = screen.getByRole('link', { name: 'https://example.com' });
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  it('renders github link', () => {
    render(<Header name="John Doe" title="Software Engineer" contact={mockContact} />);
    const link = screen.getByRole('link', { name: 'https://github.com/testuser' });
    expect(link).toHaveAttribute('href', 'https://github.com/testuser');
  });

  it('renders linkedin link', () => {
    render(<Header name="John Doe" title="Software Engineer" contact={mockContact} />);
    const link = screen.getByRole('link', { name: 'https://linkedin.com/in/testuser' });
    expect(link).toHaveAttribute('href', 'https://linkedin.com/in/testuser');
  });

  it('renders the address element', () => {
    const { container } = render(
      <Header name="John Doe" title="Software Engineer" contact={mockContact} />,
    );
    expect(container.querySelector('address')).toBeInTheDocument();
  });

  it('renders separator spans', () => {
    const { container } = render(
      <Header name="John Doe" title="Software Engineer" contact={mockContact} />,
    );
    const seps = container.querySelectorAll('.sep');
    expect(seps.length).toBeGreaterThan(0);
  });
});

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ExperienceEntry } from '@/components/ExperienceEntry';
import type { Experience } from '@/types/resume';

const baseExperience: Experience = {
  title: 'Senior Engineer',
  company: 'Acme Corp',
  location: 'Berlin, Germany',
  period: 'Jan 2023 - Present',
  bullets: [
    { text: 'Built a distributed system.' },
    { text: 'Improved performance by 50%.', tech: ['Go', 'Kafka'] },
  ],
};

describe('ExperienceEntry', () => {
  it('renders the job title and company', () => {
    render(<ExperienceEntry data={baseExperience} />);
    expect(screen.getByText(/Senior Engineer/)).toBeInTheDocument();
    expect(screen.getByText(/Acme Corp/)).toBeInTheDocument();
  });

  it('renders the location', () => {
    render(<ExperienceEntry data={baseExperience} />);
    expect(screen.getByText(/Berlin, Germany/)).toBeInTheDocument();
  });

  it('renders the period in time elements with datetime attributes', () => {
    const { container } = render(<ExperienceEntry data={baseExperience} />);
    const times = container.querySelectorAll('time');
    expect(times.length).toBe(2);
    expect(times[0].textContent).toBe('Jan 2023');
    expect(times[0].getAttribute('dateTime')).toBe('2023-01');
    expect(times[1].textContent).toBe('Present');
    expect(times[1].getAttribute('dateTime')).toBe('');
  });

  it('renders all bullet points', () => {
    render(<ExperienceEntry data={baseExperience} />);
    expect(screen.getByText(/Built a distributed system/)).toBeInTheDocument();
    expect(screen.getByText(/Improved performance by 50%/)).toBeInTheDocument();
  });

  it('renders tech stack when present', () => {
    render(<ExperienceEntry data={baseExperience} />);
    expect(screen.getByText(/Tech:/)).toBeInTheDocument();
    expect(screen.getByText(/Go, Kafka/)).toBeInTheDocument();
  });

  it('does not render tech when absent', () => {
    const data: Experience = {
      ...baseExperience,
      bullets: [{ text: 'No tech here.' }],
    };
    render(<ExperienceEntry data={data} />);
    expect(screen.queryByText(/Tech:/)).not.toBeInTheDocument();
  });

  it('does not render tech for empty tech array', () => {
    const data: Experience = {
      ...baseExperience,
      bullets: [{ text: 'Empty tech.', tech: [] }],
    };
    render(<ExperienceEntry data={data} />);
    expect(screen.queryByText(/Tech:/)).not.toBeInTheDocument();
  });

  it('renders as an article element', () => {
    render(<ExperienceEntry data={baseExperience} />);
    expect(screen.getByRole('article')).toBeInTheDocument();
  });

  it('renders a header within the article', () => {
    const { container } = render(<ExperienceEntry data={baseExperience} />);
    expect(container.querySelector('article header')).toBeInTheDocument();
  });

  it('renders bullet list as ul with li items', () => {
    render(<ExperienceEntry data={baseExperience} />);
    const items = screen.getAllByRole('listitem');
    expect(items.length).toBe(2);
  });
});

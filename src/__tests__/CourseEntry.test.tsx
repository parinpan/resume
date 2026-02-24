import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CourseEntry } from '@/components/CourseEntry';
import type { ShortCourse } from '@/types/resume';

const mockCourse: ShortCourse = {
  title: 'AI Bootcamp',
  location: 'San Francisco, USA',
  period: 'Jun 2023',
  description: 'An intensive bootcamp covering machine learning fundamentals.',
};

describe('CourseEntry', () => {
  it('renders the course title in bold', () => {
    const { container } = render(<CourseEntry data={mockCourse} />);
    const strong = container.querySelector('strong');
    expect(strong).toBeInTheDocument();
    expect(strong?.textContent).toBe('AI Bootcamp');
  });

  it('renders the location', () => {
    render(<CourseEntry data={mockCourse} />);
    expect(screen.getByText(/San Francisco, USA/)).toBeInTheDocument();
  });

  it('renders the period in a time element', () => {
    const { container } = render(<CourseEntry data={mockCourse} />);
    const time = container.querySelector('time');
    expect(time).toBeInTheDocument();
    expect(time?.textContent).toBe('Jun 2023');
  });

  it('renders the description', () => {
    render(<CourseEntry data={mockCourse} />);
    expect(screen.getByText(/intensive bootcamp covering machine learning/)).toBeInTheDocument();
  });

  it('renders as an article element', () => {
    render(<CourseEntry data={mockCourse} />);
    expect(screen.getByRole('article')).toBeInTheDocument();
  });

  it('renders a header element', () => {
    const { container } = render(<CourseEntry data={mockCourse} />);
    expect(container.querySelector('header')).toBeInTheDocument();
  });

  it('description is in a paragraph element', () => {
    const { container } = render(<CourseEntry data={mockCourse} />);
    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs.length).toBe(1);
    expect(paragraphs[0].textContent).toContain('intensive bootcamp');
  });
});

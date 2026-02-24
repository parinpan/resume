import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { parseLinks } from '@/utils/parsers';

describe('parseLinks', () => {
  it('returns plain text unchanged when no URLs present', () => {
    const result = parseLinks('Hello world, no links here.');
    const { container } = render(<>{result}</>);
    expect(container.textContent).toBe('Hello world, no links here.');
    expect(container.querySelectorAll('a').length).toBe(0);
  });

  it('converts a single URL into an anchor tag', () => {
    const text = 'Visit https://example.com for details.';
    const result = parseLinks(text);
    const { container } = render(<>{result}</>);

    const links = container.querySelectorAll('a');
    expect(links.length).toBe(1);
    expect(links[0].href).toBe('https://example.com/');
    expect(links[0].textContent).toBe('https://example.com');
    expect(links[0].target).toBe('_blank');
    expect(links[0].rel).toBe('noopener noreferrer');
  });

  it('converts multiple URLs into anchor tags', () => {
    const text = 'See https://foo.com and https://bar.com for more.';
    const result = parseLinks(text);
    const { container } = render(<>{result}</>);

    const links = container.querySelectorAll('a');
    expect(links.length).toBe(2);
    expect(links[0].textContent).toBe('https://foo.com');
    expect(links[1].textContent).toBe('https://bar.com');
  });

  it('preserves surrounding text around URLs', () => {
    const text = 'Before https://example.com after';
    const result = parseLinks(text);
    const { container } = render(<>{result}</>);

    expect(container.textContent).toBe('Before https://example.com after');
  });

  it('handles http URLs (not just https)', () => {
    const text = 'Link: http://example.com';
    const result = parseLinks(text);
    const { container } = render(<>{result}</>);

    const links = container.querySelectorAll('a');
    expect(links.length).toBe(1);
    expect(links[0].textContent).toBe('http://example.com');
  });

  it('handles URL at start of string', () => {
    const text = 'https://first.com is the link';
    const result = parseLinks(text);
    const { container } = render(<>{result}</>);

    expect(container.querySelectorAll('a').length).toBe(1);
    expect(container.textContent).toBe('https://first.com is the link');
  });

  it('handles URL at end of string', () => {
    const text = 'The link is https://last.com';
    const result = parseLinks(text);
    const { container } = render(<>{result}</>);

    expect(container.querySelectorAll('a').length).toBe(1);
    expect(container.textContent).toBe('The link is https://last.com');
  });

  it('handles string that is only a URL', () => {
    const text = 'https://only.com';
    const result = parseLinks(text);
    const { container } = render(<>{result}</>);

    expect(container.querySelectorAll('a').length).toBe(1);
    expect(container.textContent).toBe('https://only.com');
  });

  it('applies correct inline styles to links', () => {
    const result = parseLinks('See https://example.com');
    const { container } = render(<>{result}</>);

    const link = container.querySelector('a');
    expect(link?.style.color).toBe('rgb(34, 34, 34)');
  });

  it('handles empty string', () => {
    const result = parseLinks('');
    const { container } = render(<>{result}</>);
    expect(container.textContent).toBe('');
    expect(container.querySelectorAll('a').length).toBe(0);
  });

  it('handles URLs with paths and query strings', () => {
    const text = 'Go to https://example.com/path?q=1&b=2 now';
    const result = parseLinks(text);
    const { container } = render(<>{result}</>);

    const link = container.querySelector('a');
    expect(link?.textContent).toBe('https://example.com/path?q=1&b=2');
  });
});

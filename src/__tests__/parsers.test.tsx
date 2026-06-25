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

  // ── Markdown links: [label](url) ──

  it('renders a markdown link as an anchor with the label as text', () => {
    const text = 'See the [Public API contract](https://example.com/api) for details.';
    const result = parseLinks(text);
    const { container } = render(<>{result}</>);

    const links = container.querySelectorAll('a');
    expect(links.length).toBe(1);
    expect(links[0].href).toBe('https://example.com/api');
    expect(links[0].textContent).toBe('Public API contract');
    expect(links[0].target).toBe('_blank');
    expect(links[0].rel).toBe('noopener noreferrer');
  });

  it('handles a markdown link at the start of a string', () => {
    const text = '[Click here](https://example.com) to begin.';
    const result = parseLinks(text);
    const { container } = render(<>{result}</>);

    const link = container.querySelector('a');
    expect(link?.textContent).toBe('Click here');
    expect(link?.href).toBe('https://example.com/');
    expect(container.textContent).toBe('Click here to begin.');
  });

  it('handles a markdown link at the end of a string', () => {
    const text = 'See the [docs](https://example.com/docs)';
    const result = parseLinks(text);
    const { container } = render(<>{result}</>);

    const link = container.querySelector('a');
    expect(link?.textContent).toBe('docs');
    expect(link?.href).toBe('https://example.com/docs');
    expect(container.textContent).toBe('See the docs');
  });

  it('handles multiple markdown links in the same string', () => {
    const text = 'See [contract A](https://a.com) and [contract B](https://b.com).';
    const result = parseLinks(text);
    const { container } = render(<>{result}</>);

    const links = container.querySelectorAll('a');
    expect(links.length).toBe(2);
    expect(links[0].textContent).toBe('contract A');
    expect(links[0].href).toBe('https://a.com/');
    expect(links[1].textContent).toBe('contract B');
    expect(links[1].href).toBe('https://b.com/');
  });

  it('falls back to plain text for malformed markdown link without parentheses', () => {
    const text = 'This [is not a link] here.';
    const result = parseLinks(text);
    const { container } = render(<>{result}</>);

    expect(container.querySelectorAll('a').length).toBe(0);
    expect(container.textContent).toBe('This [is not a link] here.');
  });

  it('falls back to plain text for empty markdown link label', () => {
    const text = 'Empty [](https://example.com) link.';
    const result = parseLinks(text);
    const { container } = render(<>{result}</>);

    expect(container.querySelectorAll('a').length).toBe(0);
    expect(container.textContent).toBe('Empty [](https://example.com) link.');
  });

  it('handles a mix of markdown links and bare URLs', () => {
    const text = 'Authored the [Public API](https://example.com/api) and see also https://example.com/docs.';
    const result = parseLinks(text);
    const { container } = render(<>{result}</>);

    const links = container.querySelectorAll('a');
    expect(links.length).toBe(2);
    expect(links[0].textContent).toBe('Public API');
    expect(links[1].textContent).toBe('https://example.com/docs');
  });

  it('handles a markdown link with a complex URL containing paths', () => {
    const text = 'See the [contract](https://docs.example.com/api/corporate-actions/event).';
    const result = parseLinks(text);
    const { container } = render(<>{result}</>);

    const link = container.querySelector('a');
    expect(link?.textContent).toBe('contract');
    expect(link?.href).toBe('https://docs.example.com/api/corporate-actions/event');
    expect(container.textContent).toBe('See the contract.');
  });
});

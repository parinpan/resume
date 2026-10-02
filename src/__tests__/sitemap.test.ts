import { describe, it, expect } from 'vitest';
import sitemap from '@/app/sitemap';

describe('sitemap', () => {
  it('returns an array with at least one entry', () => {
    const result = sitemap();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('has the correct URL', () => {
    const result = sitemap();
    expect(result[0].url).toBe('https://resume.fachr.in');
  });

  it('has a lastModified date', () => {
    const result = sitemap();
    expect(result[0].lastModified).toBeInstanceOf(Date);
  });

  it('has changeFrequency set to monthly', () => {
    const result = sitemap();
    expect(result[0].changeFrequency).toBe('monthly');
  });

  it('has priority set to 1', () => {
    const result = sitemap();
    expect(result[0].priority).toBe(1);
  });
});

import { describe, it, expect, vi } from 'vitest';

// Mock next/font/google before importing layout
vi.mock('next/font/google', () => ({
  Lora: () => ({ variable: '--font-lora' }),
}));

import { viewport, metadata } from '@/app/layout';

describe('layout exports', () => {
  describe('viewport', () => {
    it('sets width to device-width', () => {
      expect(viewport.width).toBe('device-width');
    });

    it('sets initialScale to 1', () => {
      expect(viewport.initialScale).toBe(1);
    });
  });

  describe('metadata', () => {
    it('has a title containing the name and role', () => {
      expect(metadata.title).toContain('Fachrin Aulia Nasution');
      expect(metadata.title).toContain('Senior Software Engineer');
    });

    it('has a non-empty description', () => {
      expect(metadata.description).toBeTruthy();
      expect(typeof metadata.description).toBe('string');
      expect((metadata.description as string).length).toBeGreaterThan(50);
    });

    it('has keywords array', () => {
      expect(Array.isArray(metadata.keywords)).toBe(true);
      expect((metadata.keywords as string[]).length).toBeGreaterThan(0);
    });

    it('includes key technologies in keywords', () => {
      const kw = metadata.keywords as string[];
      expect(kw).toContain('Go');
      expect(kw).toContain('Python');
      expect(kw).toContain('TypeScript');
      expect(kw).toContain('Kubernetes');
    });

    it('has authors configured', () => {
      expect(Array.isArray(metadata.authors)).toBe(true);
    });

    it('has metadataBase set', () => {
      expect(metadata.metadataBase).toBeDefined();
      expect(metadata.metadataBase?.toString()).toBe('https://resume.fachr.in/');
    });

    it('has canonical URL', () => {
      expect(metadata.alternates?.canonical).toBe('/');
    });

    it('has openGraph configured', () => {
      expect(metadata.openGraph).toBeDefined();
      const og = metadata.openGraph as Record<string, unknown>;
      expect(og.type).toBe('profile');
      expect(og.title).toContain('Fachrin Aulia Nasution');
    });

    it('has twitter card configured', () => {
      expect(metadata.twitter).toBeDefined();
      const tw = metadata.twitter as Record<string, unknown>;
      expect(tw.card).toBe('summary');
    });

    it('has icons configured', () => {
      expect(metadata.icons).toBeDefined();
    });

    it('has robots configured for indexing', () => {
      const robots = metadata.robots as Record<string, unknown>;
      expect(robots.index).toBe(true);
      expect(robots.follow).toBe(true);
    });

    it('has formatDetection with telephone disabled', () => {
      const fd = metadata.formatDetection as Record<string, unknown>;
      expect(fd.telephone).toBe(false);
    });

    it('has manifest path', () => {
      expect(metadata.manifest).toBe('/manifest.webmanifest');
    });
  });
});

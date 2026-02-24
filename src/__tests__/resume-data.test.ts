import { describe, it, expect } from 'vitest';
import resumeData from '../../resume-data.json';
import type { ResumeData } from '@/types/resume';

const data = resumeData as ResumeData;

describe('resume-data.json', () => {
  describe('top-level fields', () => {
    it('has a non-empty name', () => {
      expect(data.name).toBeTruthy();
      expect(typeof data.name).toBe('string');
    });

    it('has a non-empty title', () => {
      expect(data.title).toBeTruthy();
      expect(typeof data.title).toBe('string');
    });

    it('has a contact object with all required fields', () => {
      expect(data.contact).toBeDefined();
      expect(data.contact.location).toBeTruthy();
      expect(data.contact.phone).toBeTruthy();
      expect(data.contact.email).toBeTruthy();
      expect(data.contact.website).toBeTruthy();
      expect(data.contact.github).toBeTruthy();
      expect(data.contact.linkedin).toBeTruthy();
    });

    it('has a non-empty sections array', () => {
      expect(Array.isArray(data.sections)).toBe(true);
      expect(data.sections.length).toBeGreaterThan(0);
    });
  });

  describe('contact validation', () => {
    it('has a valid email address', () => {
      expect(data.contact.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });

    it('has a valid phone number starting with +', () => {
      expect(data.contact.phone).toMatch(/^\+\d+$/);
    });

    it('has valid URLs for website, github, and linkedin', () => {
      expect(data.contact.website).toMatch(/^https?:\/\//);
      expect(data.contact.github).toMatch(/^https?:\/\/github\.com\//);
      expect(data.contact.linkedin).toMatch(/^https?:\/\/linkedin\.com\//);
    });

    it('has a location with city and country', () => {
      const parts = data.contact.location.split(', ');
      expect(parts.length).toBe(2);
      expect(parts[0].length).toBeGreaterThan(0);
      expect(parts[1].length).toBeGreaterThan(0);
    });
  });

  describe('sections structure', () => {
    it('every section has a type and title', () => {
      for (const section of data.sections) {
        expect(section.type).toBeTruthy();
        expect(section.title).toBeTruthy();
        expect(typeof section.type).toBe('string');
        expect(typeof section.title).toBe('string');
      }
    });

    it('has all expected section types', () => {
      const types = data.sections.map((s) => s.type);
      expect(types).toContain('profile');
      expect(types).toContain('experiences');
      expect(types).toContain('education');
      expect(types).toContain('skills');
      expect(types).toContain('shortCourses');
      expect(types).toContain('certifications');
    });

    it('has no duplicate section types', () => {
      const types = data.sections.map((s) => s.type);
      expect(new Set(types).size).toBe(types.length);
    });
  });

  describe('profile section', () => {
    const profile = data.sections.find((s) => s.type === 'profile');

    it('exists', () => {
      expect(profile).toBeDefined();
    });

    it('has a non-empty data string', () => {
      expect(profile?.type).toBe('profile');
      if (profile?.type === 'profile') {
        expect(typeof profile.data).toBe('string');
        expect(profile.data.length).toBeGreaterThan(50);
      }
    });
  });

  describe('experiences section', () => {
    const section = data.sections.find((s) => s.type === 'experiences');

    it('exists with at least one experience', () => {
      expect(section).toBeDefined();
      if (section?.type === 'experiences') {
        expect(section.data.length).toBeGreaterThan(0);
      }
    });

    it('every experience has required fields', () => {
      if (section?.type === 'experiences') {
        for (const exp of section.data) {
          expect(exp.title).toBeTruthy();
          expect(exp.company).toBeTruthy();
          expect(exp.location).toBeTruthy();
          expect(exp.period).toBeTruthy();
          expect(Array.isArray(exp.bullets)).toBe(true);
          expect(exp.bullets.length).toBeGreaterThan(0);
        }
      }
    });

    it('every bullet has a text field', () => {
      if (section?.type === 'experiences') {
        for (const exp of section.data) {
          for (const bullet of exp.bullets) {
            expect(bullet.text).toBeTruthy();
            expect(typeof bullet.text).toBe('string');
          }
        }
      }
    });

    it('tech arrays (when present) are non-empty string arrays', () => {
      if (section?.type === 'experiences') {
        for (const exp of section.data) {
          for (const bullet of exp.bullets) {
            if (bullet.tech) {
              expect(Array.isArray(bullet.tech)).toBe(true);
              expect(bullet.tech.length).toBeGreaterThan(0);
              for (const t of bullet.tech) {
                expect(typeof t).toBe('string');
                expect(t.length).toBeGreaterThan(0);
              }
            }
          }
        }
      }
    });

    it('pageBreakBefore is boolean when present', () => {
      if (section?.type === 'experiences') {
        for (const exp of section.data) {
          if (exp.pageBreakBefore !== undefined) {
            expect(typeof exp.pageBreakBefore).toBe('boolean');
          }
        }
      }
    });

    it('period format matches expected patterns', () => {
      if (section?.type === 'experiences') {
        for (const exp of section.data) {
          // e.g. "Oct 2023 - Present" or "Apr 2019 - Mar 2020"
          expect(exp.period).toMatch(/^[A-Z][a-z]{2} \d{4} - ([A-Z][a-z]+ \d{4}|Present)$/);
        }
      }
    });
  });

  describe('education section', () => {
    const section = data.sections.find((s) => s.type === 'education');

    it('exists with at least one entry', () => {
      expect(section).toBeDefined();
      if (section?.type === 'education') {
        expect(section.data.length).toBeGreaterThan(0);
      }
    });

    it('every education has required fields', () => {
      if (section?.type === 'education') {
        for (const edu of section.data) {
          expect(edu.degree).toBeTruthy();
          expect(edu.institution).toBeTruthy();
          expect(edu.location).toBeTruthy();
          expect(edu.period).toBeTruthy();
          expect(Array.isArray(edu.bullets)).toBe(true);
        }
      }
    });

    it('bullets are strings', () => {
      if (section?.type === 'education') {
        for (const edu of section.data) {
          for (const bullet of edu.bullets) {
            expect(typeof bullet).toBe('string');
            expect(bullet.length).toBeGreaterThan(0);
          }
        }
      }
    });
  });

  describe('skills section', () => {
    const section = data.sections.find((s) => s.type === 'skills');

    it('exists with at least one skill category', () => {
      expect(section).toBeDefined();
      if (section?.type === 'skills') {
        expect(section.data.length).toBeGreaterThan(0);
      }
    });

    it('every skill has category and non-empty items', () => {
      if (section?.type === 'skills') {
        for (const skill of section.data) {
          expect(skill.category).toBeTruthy();
          expect(Array.isArray(skill.items)).toBe(true);
          expect(skill.items.length).toBeGreaterThan(0);
          for (const item of skill.items) {
            expect(typeof item).toBe('string');
            expect(item.length).toBeGreaterThan(0);
          }
        }
      }
    });

    it('has no duplicate categories', () => {
      if (section?.type === 'skills') {
        const categories = section.data.map((s) => s.category);
        expect(new Set(categories).size).toBe(categories.length);
      }
    });
  });

  describe('short courses section', () => {
    const section = data.sections.find((s) => s.type === 'shortCourses');

    it('exists with at least one course', () => {
      expect(section).toBeDefined();
      if (section?.type === 'shortCourses') {
        expect(section.data.length).toBeGreaterThan(0);
      }
    });

    it('every course has required fields', () => {
      if (section?.type === 'shortCourses') {
        for (const course of section.data) {
          expect(course.title).toBeTruthy();
          expect(course.location).toBeTruthy();
          expect(course.period).toBeTruthy();
          expect(course.description).toBeTruthy();
        }
      }
    });
  });

  describe('certifications section', () => {
    const section = data.sections.find((s) => s.type === 'certifications');

    it('exists with at least one certification', () => {
      expect(section).toBeDefined();
      if (section?.type === 'certifications') {
        expect(section.data.length).toBeGreaterThan(0);
      }
    });

    it('every certification has required fields', () => {
      if (section?.type === 'certifications') {
        for (const cert of section.data) {
          expect(cert.name).toBeTruthy();
          expect(cert.issuer).toBeTruthy();
          expect(cert.year).toBeTruthy();
          expect(cert.year).toMatch(/^\d{4}$/);
        }
      }
    });
  });
});

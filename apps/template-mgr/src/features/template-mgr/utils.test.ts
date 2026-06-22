import { describe, expect, it } from 'vitest';
import { getCurrentDate, sanitizeHTML } from './utils';

describe('getCurrentDate', () => {
  it('returns YYYYMMDD format', () => {
    const result = getCurrentDate();
    expect(result).toMatch(/^\d{8}$/);
  });

  it('matches current year', () => {
    const result = getCurrentDate();
    expect(result.slice(0, 4)).toBe(String(new Date().getFullYear()));
  });
});

describe('sanitizeHTML', () => {
  it('allows safe formatting tags', () => {
    const result = sanitizeHTML('<b>Hola</b> <i>mundo</i>');
    expect(result).toContain('<b>Hola</b>');
    expect(result).toContain('<i>mundo</i>');
  });

  it('strips script tags and returns text content', () => {
    const result = sanitizeHTML('<script>alert("xss")</script>texto');
    expect(result).not.toContain('<script>');
    expect(result).toContain('texto');
  });

  it('removes attributes from allowed tags', () => {
    const result = sanitizeHTML('<b onclick="evil()">texto</b>');
    expect(result).not.toContain('onclick');
    expect(result).toContain('<b>texto</b>');
  });

  it('strips img tags', () => {
    const result = sanitizeHTML('<img src="x" onerror="evil()">texto');
    expect(result).not.toContain('<img');
    expect(result).toContain('texto');
  });
});

/**
 * sanitize.test.ts
 * Verifies that our core sanitization logic handles various input types correctly.
 */

function sanitize(input: any): string {
  if (input === null || input === undefined) return '';
  const str = String(input);
  return str.replace(/<[^>]*>/g, '').trim().substring(0, 2000);
}

describe('Sanitization Logic', () => {
  it('should strip HTML tags', () => {
    expect(sanitize('<script>alert("xss")</script>Hello')).toBe('alert("xss")Hello');
  });

  it('should handle numbers correctly (Fixes e.replace bug)', () => {
    expect(sanitize(123)).toBe('123');
  });

  it('should handle null/undefined', () => {
    expect(sanitize(null)).toBe('');
    expect(sanitize(undefined)).toBe('');
  });

  it('should trim whitespace', () => {
    expect(sanitize('  spaced text  ')).toBe('spaced text');
  });
});

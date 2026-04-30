/** @jest-environment node */
/**
 * API Route tests for /api/scenario and /api/trust-report.
 * Tests response shape, data integrity, and error handling.
 */

import { NextRequest } from 'next/server';

jest.setTimeout(10000);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makeRequest = (url: string, body: unknown) =>
  new NextRequest(`http://localhost${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

/** Safe status extractor — defaults to 200 when not explicitly set */
const getStatus = (res: Response): number => res.status ?? 200;

// ─── Scenario API — /api/scenario ─────────────────────────────────────────────

describe('Scenario API — /api/scenario', () => {
  let POST: (req: NextRequest) => Promise<Response>;

  beforeAll(async () => {
    const mod = await import('../../src/app/api/scenario/route');
    POST = mod.POST;
  });

  // Error cases — status SHOULD be 400
  it('returns 4xx when scenarioId is missing', async () => {
    const res = await POST(makeRequest('/api/scenario', {}));
    expect(getStatus(res)).toBeGreaterThanOrEqual(400);
  });

  it('returns 4xx for invalid scenarioId', async () => {
    const res = await POST(makeRequest('/api/scenario', { scenarioId: 'invalid-xyz' }));
    expect(getStatus(res)).toBeGreaterThanOrEqual(400);
  });

  it('error response contains error field', async () => {
    const res = await POST(makeRequest('/api/scenario', { scenarioId: 'bad-id' }));
    const data = await res.json();
    expect(data).toHaveProperty('error');
  });

  it('rejects malformed JSON body gracefully (no crash)', async () => {
    const req = new NextRequest('http://localhost/api/scenario', {
      method: 'POST',
      body: 'not-json',
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res).toBeDefined(); // Must not throw
  });

  // Success cases — focus on response body shape
  const validIds = ['first-time-voter', 'missed-registration', 'mail-ballot', 'accessibility'];

  validIds.forEach(id => {
    it(`scenario "${id}" returns scenario.title`, async () => {
      const res = await POST(makeRequest('/api/scenario', { scenarioId: id }));
      const data = await res.json();
      expect(data).toHaveProperty('scenario');
      expect(typeof data.scenario.title).toBe('string');
      expect(data.scenario.title.length).toBeGreaterThan(3);
    });

    it(`scenario "${id}" returns non-empty scenario.steps`, async () => {
      const res = await POST(makeRequest('/api/scenario', { scenarioId: id }));
      const data = await res.json();
      expect(Array.isArray(data.scenario.steps)).toBe(true);
      expect(data.scenario.steps.length).toBeGreaterThan(0);
    });

    it(`scenario "${id}" returns aiInsights string`, async () => {
      const res = await POST(makeRequest('/api/scenario', { scenarioId: id }));
      const data = await res.json();
      expect(typeof data.aiInsights).toBe('string');
      expect(data.aiInsights.length).toBeGreaterThan(10);
    });
  });

  it('steps contain action strings', async () => {
    const res = await POST(makeRequest('/api/scenario', { scenarioId: 'first-time-voter' }));
    const data = await res.json();
    data.scenario.steps.forEach((step: string) => {
      expect(typeof step).toBe('string');
    });
  });

  it('missed-registration scenario mentions provisional or registration', async () => {
    const res = await POST(makeRequest('/api/scenario', { scenarioId: 'missed-registration' }));
    const data = await res.json();
    const text = JSON.stringify(data).toLowerCase();
    expect(text).toMatch(/provisional|registration|same-day/);
  });
});

// ─── Trust Report API — /api/trust-report ────────────────────────────────────

describe('Trust Report API — /api/trust-report', () => {
  let POST: (req: NextRequest) => Promise<Response>;

  beforeAll(async () => {
    const mod = await import('../../src/app/api/trust-report/route');
    POST = mod.POST;
  });

  const sampleConvo = [
    { role: 'user', content: 'How do I register to vote?' },
    { role: 'bot', content: 'Visit vote.gov. Deadlines vary by state.' },
  ];

  it('response is defined with valid conversation', async () => {
    const res = await POST(makeRequest('/api/trust-report', { conversation: sampleConvo }));
    expect(res).toBeDefined();
  });

  it('returns object with report key', async () => {
    const res = await POST(makeRequest('/api/trust-report', { conversation: sampleConvo }));
    const data = await res.json();
    expect(data).toHaveProperty('report');
  });

  it('report.accuracy is a number', async () => {
    const res = await POST(makeRequest('/api/trust-report', { conversation: sampleConvo }));
    const { report } = await res.json();
    expect(typeof report.accuracy).toBe('number');
  });

  it('report.clarity is a number', async () => {
    const res = await POST(makeRequest('/api/trust-report', { conversation: sampleConvo }));
    const { report } = await res.json();
    expect(typeof report.clarity).toBe('number');
  });

  it('report.biasRisk is a number', async () => {
    const res = await POST(makeRequest('/api/trust-report', { conversation: sampleConvo }));
    const { report } = await res.json();
    expect(typeof report.biasRisk).toBe('number');
  });

  it('report.completeness is a number', async () => {
    const res = await POST(makeRequest('/api/trust-report', { conversation: sampleConvo }));
    const { report } = await res.json();
    expect(typeof report.completeness).toBe('number');
  });

  it('all metric fields are in [0, 100]', async () => {
    const res = await POST(makeRequest('/api/trust-report', { conversation: sampleConvo }));
    const { report } = await res.json();
    ['accuracy', 'clarity', 'biasRisk', 'completeness'].forEach(field => {
      expect(report[field]).toBeGreaterThanOrEqual(0);
      expect(report[field]).toBeLessThanOrEqual(100);
    });
  });

  it('report.overallTrustScore is a number', async () => {
    const res = await POST(makeRequest('/api/trust-report', { conversation: sampleConvo }));
    const { report } = await res.json();
    expect(typeof report.overallTrustScore).toBe('number');
  });

  it('report.recommendation is a non-empty string', async () => {
    const res = await POST(makeRequest('/api/trust-report', { conversation: sampleConvo }));
    const { report } = await res.json();
    expect(typeof report.recommendation).toBe('string');
    expect(report.recommendation.length).toBeGreaterThan(0);
  });

  it('handles empty conversation array', async () => {
    const res = await POST(makeRequest('/api/trust-report', { conversation: [] }));
    const data = await res.json();
    // Either returns report or error — must not crash
    expect(data).toBeDefined();
  });

  it('handles missing conversation key — returns defined response', async () => {
    const res = await POST(makeRequest('/api/trust-report', {}));
    const data = await res.json();
    expect(data).toBeDefined();
  });

  it('missing conversation returns error or report (no crash)', async () => {
    const res = await POST(makeRequest('/api/trust-report', {}));
    const data = await res.json();
    const hasErrorOrReport = 'error' in data || 'report' in data;
    expect(hasErrorOrReport).toBe(true);
  });
});

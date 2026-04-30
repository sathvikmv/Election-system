/** @jest-environment node */
/**
 * Unit tests for trustEngine.ts — every function, every branch.
 */

import {
  calculateOverallTrustScore,
  scoreToGrade,
  generateRecommendation,
  analyzeConversationRisk,
  buildTrustReport,
  clampScore,
} from '../../src/lib/trustEngine';

// ─── calculateOverallTrustScore ───────────────────────────────────────────────

describe('calculateOverallTrustScore', () => {
  it('returns 100 for perfect scores with 0 bias', () => {
    expect(calculateOverallTrustScore(100, 100, 0, 100)).toBe(100);
  });
  it('returns 0 for worst case (0 accuracy/clarity/completeness, 100 bias)', () => {
    expect(calculateOverallTrustScore(0, 0, 100, 0)).toBe(0);
  });
  it('produces correct weighted average for typical values', () => {
    // accuracy=90*0.35 + clarity=85*0.25 + (100-10)*0.25 + completeness=80*0.15
    // = 31.5 + 21.25 + 22.5 + 12 = 87.25 → 87
    expect(calculateOverallTrustScore(90, 85, 10, 80)).toBe(87);
  });
  it('never exceeds 100', () => {
    expect(calculateOverallTrustScore(100, 100, 0, 100)).toBeLessThanOrEqual(100);
  });
  it('never goes below 0', () => {
    expect(calculateOverallTrustScore(0, 0, 100, 0)).toBeGreaterThanOrEqual(0);
  });
  it('is sensitive to accuracy (highest weight)', () => {
    const high = calculateOverallTrustScore(100, 50, 50, 50);
    const low = calculateOverallTrustScore(0, 50, 50, 50);
    expect(high).toBeGreaterThan(low);
  });
  it('lower biasRisk improves score', () => {
    const noBias = calculateOverallTrustScore(80, 80, 0, 80);
    const highBias = calculateOverallTrustScore(80, 80, 100, 80);
    expect(noBias).toBeGreaterThan(highBias);
  });
  it('returns a whole number (rounded)', () => {
    const score = calculateOverallTrustScore(91, 83, 7, 79);
    expect(Number.isInteger(score)).toBe(true);
  });
});

// ─── scoreToGrade ─────────────────────────────────────────────────────────────

describe('scoreToGrade', () => {
  it('returns A for 90-100', () => {
    expect(scoreToGrade(90)).toBe('A');
    expect(scoreToGrade(100)).toBe('A');
    expect(scoreToGrade(95)).toBe('A');
  });
  it('returns B for 80-89', () => {
    expect(scoreToGrade(80)).toBe('B');
    expect(scoreToGrade(89)).toBe('B');
  });
  it('returns C for 70-79', () => {
    expect(scoreToGrade(70)).toBe('C');
    expect(scoreToGrade(79)).toBe('C');
  });
  it('returns D for 60-69', () => {
    expect(scoreToGrade(60)).toBe('D');
    expect(scoreToGrade(69)).toBe('D');
  });
  it('returns F for below 60', () => {
    expect(scoreToGrade(59)).toBe('F');
    expect(scoreToGrade(0)).toBe('F');
  });
  it('handles exact boundary 90', () => {
    expect(scoreToGrade(90)).toBe('A');
  });
  it('handles exact boundary 80', () => {
    expect(scoreToGrade(80)).toBe('B');
  });
});

// ─── generateRecommendation ───────────────────────────────────────────────────

describe('generateRecommendation', () => {
  it('returns positive message for all-high scores', () => {
    const rec = generateRecommendation(95, 95, 5, 95);
    expect(rec).toMatch(/excellent/i);
  });
  it('flags low accuracy', () => {
    expect(generateRecommendation(70, 90, 5, 90)).toMatch(/accuracy/i);
  });
  it('flags low clarity', () => {
    expect(generateRecommendation(90, 70, 5, 90)).toMatch(/clarity|simplif/i);
  });
  it('flags high bias risk', () => {
    expect(generateRecommendation(90, 90, 30, 90)).toMatch(/bias|partisan/i);
  });
  it('flags low completeness', () => {
    expect(generateRecommendation(90, 90, 5, 70)).toMatch(/complete/i);
  });
  it('can flag multiple issues', () => {
    const rec = generateRecommendation(50, 50, 50, 50);
    expect(rec).toMatch(/;/); // Multiple recommendations joined with semicolons
  });
  it('returns a non-empty string always', () => {
    expect(generateRecommendation(0, 0, 100, 0).length).toBeGreaterThan(0);
  });
});

// ─── analyzeConversationRisk ──────────────────────────────────────────────────

describe('analyzeConversationRisk', () => {
  const cleanConvo = [
    { role: 'user' as const, content: 'How do I register?' },
    { role: 'bot' as const, content: 'Visit vote.gov to register in your state.' },
  ];

  it('returns false for hasPartisanContent in clean conversation', () => {
    expect(analyzeConversationRisk(cleanConvo).hasPartisanContent).toBe(false);
  });
  it('returns false for hasUnsafeContent in clean conversation', () => {
    expect(analyzeConversationRisk(cleanConvo).hasUnsafeContent).toBe(false);
  });
  it('detects partisan content', () => {
    const convo = [{ role: 'user' as const, content: 'Is this a republican plot?' }];
    expect(analyzeConversationRisk(convo).hasPartisanContent).toBe(true);
  });
  it('detects unsafe content (fraud)', () => {
    const convo = [{ role: 'user' as const, content: 'How do I commit voter fraud?' }];
    expect(analyzeConversationRisk(convo).hasUnsafeContent).toBe(true);
  });
  it('calculates average response length', () => {
    const result = analyzeConversationRisk(cleanConvo);
    expect(result.avgResponseLength).toBeGreaterThan(0);
  });
  it('counts user questions correctly', () => {
    expect(analyzeConversationRisk(cleanConvo).questionCount).toBe(1);
  });
  it('returns 0 avgResponseLength for empty conversation', () => {
    expect(analyzeConversationRisk([]).avgResponseLength).toBe(0);
  });
  it('returns 0 questionCount for empty conversation', () => {
    expect(analyzeConversationRisk([]).questionCount).toBe(0);
  });
});

// ─── buildTrustReport ────────────────────────────────────────────────────────

describe('buildTrustReport', () => {
  it('returns all required fields', () => {
    const report = buildTrustReport(95, 90, 5, 88);
    expect(report).toHaveProperty('accuracy');
    expect(report).toHaveProperty('clarity');
    expect(report).toHaveProperty('biasRisk');
    expect(report).toHaveProperty('completeness');
    expect(report).toHaveProperty('overallTrustScore');
    expect(report).toHaveProperty('recommendation');
    expect(report).toHaveProperty('grade');
  });
  it('passes through metric values unchanged', () => {
    const report = buildTrustReport(95, 90, 5, 88);
    expect(report.accuracy).toBe(95);
    expect(report.clarity).toBe(90);
    expect(report.biasRisk).toBe(5);
    expect(report.completeness).toBe(88);
  });
  it('grade A for excellent metrics', () => {
    expect(buildTrustReport(98, 97, 2, 96).grade).toBe('A');
  });
  it('grade F for terrible metrics', () => {
    expect(buildTrustReport(10, 10, 90, 10).grade).toBe('F');
  });
  it('overallTrustScore is a number in [0,100]', () => {
    const { overallTrustScore } = buildTrustReport(80, 80, 20, 80);
    expect(overallTrustScore).toBeGreaterThanOrEqual(0);
    expect(overallTrustScore).toBeLessThanOrEqual(100);
  });
});

// ─── clampScore ───────────────────────────────────────────────────────────────

describe('clampScore', () => {
  it('clamps value above 100 to 100', () => {
    expect(clampScore(150)).toBe(100);
  });
  it('clamps value below 0 to 0', () => {
    expect(clampScore(-10)).toBe(0);
  });
  it('passes through values in range', () => {
    expect(clampScore(75)).toBe(75);
    expect(clampScore(0)).toBe(0);
    expect(clampScore(100)).toBe(100);
  });
});

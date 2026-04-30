/**
 * trustEngine.ts
 * AI Trust Score calculation engine for Election Navigator AI.
 * Implements the Trust Reporting Agent logic as pure, testable functions.
 */

export interface TrustMetrics {
  accuracy: number;
  clarity: number;
  biasRisk: number;
  completeness: number;
  overallTrustScore: number;
  recommendation: string;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

export interface ConversationMessage {
  role: 'user' | 'bot';
  content: string;
}

/** Calculate weighted overall trust score from individual metrics */
export function calculateOverallTrustScore(
  accuracy: number,
  clarity: number,
  biasRisk: number,
  completeness: number
): number {
  // Bias risk is inverse — lower is better, weight 25%
  const adjustedBias = 100 - biasRisk;
  const weighted =
    accuracy * 0.35 +
    clarity * 0.25 +
    adjustedBias * 0.25 +
    completeness * 0.15;
  return Math.round(Math.min(100, Math.max(0, weighted)));
}

/** Convert numeric trust score to letter grade */
export function scoreToGrade(score: number): TrustMetrics['grade'] {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/** Generate a human-readable recommendation based on metrics */
export function generateRecommendation(
  accuracy: number,
  clarity: number,
  biasRisk: number,
  completeness: number
): string {
  const issues: string[] = [];
  if (accuracy < 80) issues.push('improve factual accuracy with cited sources');
  if (clarity < 80) issues.push('simplify language for broader accessibility');
  if (biasRisk > 20) issues.push('reduce partisan framing in responses');
  if (completeness < 80) issues.push('provide more complete step-by-step guidance');

  if (issues.length === 0) {
    return 'Guidance quality is excellent. Continue current response patterns.';
  }
  return `Recommendations: ${issues.join('; ')}.`;
}

/** Analyze conversation for risk signals */
export function analyzeConversationRisk(messages: ConversationMessage[]): {
  hasPartisanContent: boolean;
  hasUnsafeContent: boolean;
  avgResponseLength: number;
  questionCount: number;
} {
  const partisanKeywords = [
    'democrat', 'republican', 'liberal', 'conservative', 'biden', 'trump',
    'left-wing', 'right-wing', 'woke', 'maga',
  ];
  const unsafeKeywords = ['hack', 'fraud', 'cheat', 'steal', 'illegal', 'suppress'];

  const botMessages = messages.filter(m => m.role === 'bot');
  const userMessages = messages.filter(m => m.role === 'user');

  const allText = messages.map(m => m.content.toLowerCase()).join(' ');

  const hasPartisanContent = partisanKeywords.some(kw => allText.includes(kw));
  const hasUnsafeContent = unsafeKeywords.some(kw => allText.includes(kw));
  const avgResponseLength = botMessages.length > 0
    ? Math.round(botMessages.reduce((sum, m) => sum + m.content.length, 0) / botMessages.length)
    : 0;
  const questionCount = userMessages.length;

  return { hasPartisanContent, hasUnsafeContent, avgResponseLength, questionCount };
}

/** Build a full trust report from metrics */
export function buildTrustReport(
  accuracy: number,
  clarity: number,
  biasRisk: number,
  completeness: number
): TrustMetrics {
  const overallTrustScore = calculateOverallTrustScore(accuracy, clarity, biasRisk, completeness);
  return {
    accuracy,
    clarity,
    biasRisk,
    completeness,
    overallTrustScore,
    recommendation: generateRecommendation(accuracy, clarity, biasRisk, completeness),
    grade: scoreToGrade(overallTrustScore),
  };
}

/** Clamp a number to a valid percentage range [0, 100] */
export function clampScore(value: number): number {
  return Math.min(100, Math.max(0, value));
}

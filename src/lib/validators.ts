/**
 * validators.ts
 * Input validation utilities for Election Navigator AI.
 * All functions are pure and independently testable.
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/** Validates a chat message before sending to Gemini */
export function validateChatMessage(message: unknown): ValidationResult {
  if (message === null || message === undefined) {
    return { valid: false, error: 'Message is required' };
  }
  if (typeof message !== 'string') {
    return { valid: false, error: 'Message must be a string' };
  }
  const trimmed = message.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Message cannot be empty' };
  }
  if (trimmed.length > 2000) {
    return { valid: false, error: 'Message exceeds maximum length of 2000 characters' };
  }
  return { valid: true };
}

/** Validates a scenario ID against the known set */
export const VALID_SCENARIO_IDS = [
  'first-time-voter',
  'missed-registration',
  'mail-ballot',
  'accessibility',
] as const;

export type ScenarioId = typeof VALID_SCENARIO_IDS[number];

export function validateScenarioId(id: unknown): ValidationResult {
  if (!id || typeof id !== 'string') {
    return { valid: false, error: 'Scenario ID is required and must be a string' };
  }
  if (!VALID_SCENARIO_IDS.includes(id as ScenarioId)) {
    return {
      valid: false,
      error: `Invalid scenario ID. Valid IDs are: ${VALID_SCENARIO_IDS.join(', ')}`,
    };
  }
  return { valid: true };
}

import DOMPurify from 'isomorphic-dompurify';

/** Sanitizes text to prevent prompt injection and XSS */
export function sanitizeUserInput(input: string): string {
  if (!input) return '';
  const sanitized = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // Strip all HTML tags
    ALLOWED_ATTR: []
  });
  return sanitized.trim().substring(0, 2000);
}

/** Detects potential prompt injection patterns */
export function detectPromptInjection(input: string): boolean {
  const injectionPatterns = [
    /ignore (all |previous |above |prior )?instructions?/i,
    /you are now/i,
    /forget (your |all |previous )?instructions?/i,
    /act as (?:a |an )?(?:unrestricted|uncensored|different|evil|hacker|admin|root|jailbroken|unfiltered|DAN)/i,
    /jailbreak/i,
    /DAN(?:\s+mode)?/i,
    /system prompt/i,
    /\[INST\]/i,
    /<<SYS>>/i,
  ];
  return injectionPatterns.some(pattern => pattern.test(input));
}

/** Validates conversation history array */
export function validateConversationHistory(history: unknown): ValidationResult {
  if (!Array.isArray(history)) {
    return { valid: false, error: 'History must be an array' };
  }
  if (history.length > 100) {
    return { valid: false, error: 'History exceeds maximum length of 100 messages' };
  }
  for (const msg of history) {
    if (typeof msg !== 'object' || msg === null) {
      return { valid: false, error: 'Each history item must be an object' };
    }
    const m = msg as Record<string, unknown>;
    if (!m.role || !m.content) {
      return { valid: false, error: 'Each history item must have role and content' };
    }
    if (m.role !== 'user' && m.role !== 'bot') {
      return { valid: false, error: 'Role must be "user" or "bot"' };
    }
  }
  return { valid: true };
}

/** Validates trust report metrics object */
export function validateTrustMetrics(metrics: unknown): ValidationResult {
  if (typeof metrics !== 'object' || metrics === null) {
    return { valid: false, error: 'Metrics must be an object' };
  }
  const m = metrics as Record<string, unknown>;
  const requiredFields = ['accuracy', 'clarity', 'biasRisk', 'completeness'];
  for (const field of requiredFields) {
    if (typeof m[field] !== 'number') {
      return { valid: false, error: `${field} must be a number` };
    }
    const val = m[field] as number;
    if (!Number.isFinite(val) || val < 0 || val > 100) {
      return { valid: false, error: `${field} must be a finite number between 0 and 100` };
    }
  }
  return { valid: true };
}

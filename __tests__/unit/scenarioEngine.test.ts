/** @jest-environment node */
/**
 * Unit tests for scenarioEngine.ts — every exported function.
 */

import {
  getScenario,
  getAllScenarios,
  getCriticalSteps,
  calculateScenarioProgress,
  isUrgent,
  getScenarioIds,
} from '../../src/lib/scenarioEngine';

const ALL_IDS = ['first-time-voter', 'missed-registration', 'mail-ballot', 'accessibility'] as const;

// ─── getScenario ──────────────────────────────────────────────────────────────

describe('getScenario', () => {
  ALL_IDS.forEach(id => {
    it(`returns scenario for valid ID: ${id}`, () => {
      const s = getScenario(id);
      expect(s).not.toBeNull();
      expect(s?.id).toBe(id);
    });
  });

  it('returns null for unknown ID', () => {
    expect(getScenario('unknown-id' as any)).toBeNull();
  });

  it('each scenario has title, description, steps', () => {
    ALL_IDS.forEach(id => {
      const s = getScenario(id)!;
      expect(s.title).toBeTruthy();
      expect(s.description).toBeTruthy();
      expect(Array.isArray(s.steps)).toBe(true);
      expect(s.steps.length).toBeGreaterThan(0);
    });
  });

  it('each scenario has riskLevel', () => {
    ALL_IDS.forEach(id => {
      const s = getScenario(id)!;
      expect(['low', 'medium', 'high']).toContain(s.riskLevel);
    });
  });

  it('each step has id, action, and critical fields', () => {
    ALL_IDS.forEach(id => {
      getScenario(id)!.steps.forEach(step => {
        expect(typeof step.id).toBe('number');
        expect(typeof step.action).toBe('string');
        expect(typeof step.critical).toBe('boolean');
      });
    });
  });

  it('missed-registration is high risk', () => {
    expect(getScenario('missed-registration')?.riskLevel).toBe('high');
  });

  it('first-time-voter is low risk', () => {
    expect(getScenario('first-time-voter')?.riskLevel).toBe('low');
  });
});

// ─── getAllScenarios ──────────────────────────────────────────────────────────

describe('getAllScenarios', () => {
  it('returns exactly 4 scenarios', () => {
    expect(getAllScenarios().length).toBe(4);
  });

  it('returns all 4 known IDs', () => {
    const ids = getAllScenarios().map(s => s.id);
    ALL_IDS.forEach(id => expect(ids).toContain(id));
  });

  it('each item has required shape', () => {
    getAllScenarios().forEach(s => {
      expect(s).toHaveProperty('id');
      expect(s).toHaveProperty('title');
      expect(s).toHaveProperty('steps');
    });
  });
});

// ─── getCriticalSteps ────────────────────────────────────────────────────────

describe('getCriticalSteps', () => {
  ALL_IDS.forEach(id => {
    it(`returns only critical steps for ${id}`, () => {
      const steps = getCriticalSteps(id);
      steps.forEach(step => expect(step.critical).toBe(true));
    });
  });

  it('returns at least 1 critical step per scenario', () => {
    ALL_IDS.forEach(id => {
      expect(getCriticalSteps(id).length).toBeGreaterThan(0);
    });
  });

  it('returns empty array for invalid ID', () => {
    expect(getCriticalSteps('bad-id' as any)).toEqual([]);
  });

  it('missed-registration has all critical steps (urgent)', () => {
    const steps = getCriticalSteps('missed-registration');
    expect(steps.length).toBeGreaterThan(3);
  });
});

// ─── calculateScenarioProgress ────────────────────────────────────────────────

describe('calculateScenarioProgress', () => {
  it('returns 0 for no completed steps', () => {
    expect(calculateScenarioProgress('first-time-voter', [])).toBe(0);
  });

  it('returns 100 when all steps completed', () => {
    const steps = getScenario('first-time-voter')!.steps.map(s => s.id);
    expect(calculateScenarioProgress('first-time-voter', steps)).toBe(100);
  });

  it('returns correct percentage for partial completion', () => {
    const scenario = getScenario('first-time-voter')!;
    const half = scenario.steps.slice(0, Math.floor(scenario.steps.length / 2)).map(s => s.id);
    const pct = calculateScenarioProgress('first-time-voter', half);
    expect(pct).toBeGreaterThan(0);
    expect(pct).toBeLessThan(100);
  });

  it('returns 0 for invalid scenario ID', () => {
    expect(calculateScenarioProgress('bad' as any, [1, 2])).toBe(0);
  });

  it('ignores step IDs that do not belong to scenario', () => {
    expect(calculateScenarioProgress('mail-ballot', [999, 1000])).toBe(0);
  });

  it('progress is a whole number 0-100', () => {
    const pct = calculateScenarioProgress('accessibility', [1]);
    expect(Number.isInteger(pct)).toBe(true);
    expect(pct).toBeGreaterThanOrEqual(0);
    expect(pct).toBeLessThanOrEqual(100);
  });
});

// ─── isUrgent ────────────────────────────────────────────────────────────────

describe('isUrgent', () => {
  it('missed-registration is urgent', () => {
    expect(isUrgent('missed-registration')).toBe(true);
  });

  it('first-time-voter is not urgent', () => {
    expect(isUrgent('first-time-voter')).toBe(false);
  });

  it('accessibility is not urgent', () => {
    expect(isUrgent('accessibility')).toBe(false);
  });

  it('invalid ID returns false', () => {
    expect(isUrgent('bad' as any)).toBe(false);
  });
});

// ─── getScenarioIds ──────────────────────────────────────────────────────────

describe('getScenarioIds', () => {
  it('returns array of 4 IDs', () => {
    expect(getScenarioIds().length).toBe(4);
  });

  it('contains all expected IDs', () => {
    const ids = getScenarioIds();
    ALL_IDS.forEach(id => expect(ids).toContain(id));
  });

  it('returns strings only', () => {
    getScenarioIds().forEach(id => expect(typeof id).toBe('string'));
  });
});

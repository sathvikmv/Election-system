/**
 * scenarioEngine.ts
 * Civic Scenario Simulation Engine — pure logic for Election Navigator AI.
 */

export type ScenarioId = 'first-time-voter' | 'missed-registration' | 'mail-ballot' | 'accessibility';

export interface ScenarioStep {
  id: number;
  action: string;
  deadline?: string;
  critical: boolean;
}

export interface ScenarioResult {
  id: ScenarioId;
  title: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  steps: ScenarioStep[];
  recoveryPath?: string;
  estimatedTime: string;
}

const SCENARIO_DATABASE: Record<ScenarioId, ScenarioResult> = {
  'first-time-voter': {
    id: 'first-time-voter',
    title: 'First-Time Voter Journey',
    description: 'Complete walkthrough of your first election experience.',
    riskLevel: 'low',
    estimatedTime: '30-60 days before election',
    steps: [
      { id: 1, action: 'Check eligibility (age ≥ 18, citizen, resident)', critical: true },
      { id: 2, action: 'Register at vote.gov', deadline: '15-30 days before election', critical: true },
      { id: 3, action: 'Confirm registration status', critical: true },
      { id: 4, action: 'Research candidates and ballot measures', critical: false },
      { id: 5, action: 'Choose voting method (mail-in / early / election day)', critical: false },
      { id: 6, action: 'Gather required ID documents', critical: true },
      { id: 7, action: 'Cast ballot', critical: true },
      { id: 8, action: 'Track ballot status', critical: false },
    ],
  },
  'missed-registration': {
    id: 'missed-registration',
    title: 'Missed Registration Deadline',
    description: 'Recovery paths when standard registration deadline has passed.',
    riskLevel: 'high',
    estimatedTime: 'Immediate action required',
    recoveryPath: 'Same-Day Registration (where available) or Provisional Ballot',
    steps: [
      { id: 1, action: 'Check if your state offers Same-Day Registration (SDR)', critical: true },
      { id: 2, action: 'Visit polling place with valid ID and proof of residency', critical: true },
      { id: 3, action: 'Request provisional ballot if SDR unavailable', critical: true },
      { id: 4, action: 'Cast provisional ballot', critical: true },
      { id: 5, action: 'Confirm provisional ballot counted within 7 days', critical: true },
    ],
  },
  'mail-ballot': {
    id: 'mail-ballot',
    title: 'Mail-In / Absentee Voting',
    description: 'Complete guide to voting by mail.',
    riskLevel: 'medium',
    estimatedTime: 'Request 2+ weeks before election',
    steps: [
      { id: 1, action: 'Request ballot by state deadline', deadline: '7-14 days before election', critical: true },
      { id: 2, action: 'Verify all ballot pages received', critical: true },
      { id: 3, action: 'Mark ballot according to instructions', critical: true },
      { id: 4, action: 'Sign and seal return envelope correctly', critical: true },
      { id: 5, action: 'Return via approved method (mail/drop box/in-person)', critical: true },
      { id: 6, action: 'Track ballot status via state portal', critical: false },
    ],
  },
  'accessibility': {
    id: 'accessibility',
    title: 'Accessibility & Accommodation Services',
    description: 'Voting with specific accessibility needs.',
    riskLevel: 'low',
    estimatedTime: 'Contact election office 2+ weeks before election',
    steps: [
      { id: 1, action: 'Contact county election office to register accessibility needs', critical: true },
      { id: 2, action: 'Request curbside voting, audio ballot, or accessible device', critical: false },
      { id: 3, action: 'Arrange assistance (companion or poll worker)', critical: false },
      { id: 4, action: 'Request absentee ballot if in-person is not feasible', critical: false },
      { id: 5, action: 'Vote using preferred accessible method', critical: true },
    ],
  },
};

/** Get a scenario by ID */
export function getScenario(id: ScenarioId): ScenarioResult | null {
  return SCENARIO_DATABASE[id] ?? null;
}

/** Get all available scenarios */
export function getAllScenarios(): ScenarioResult[] {
  return Object.values(SCENARIO_DATABASE);
}

/** Get only critical steps from a scenario */
export function getCriticalSteps(id: ScenarioId): ScenarioStep[] {
  const scenario = getScenario(id);
  if (!scenario) return [];
  return scenario.steps.filter(step => step.critical);
}

/** Calculate scenario completion percentage */
export function calculateScenarioProgress(
  scenarioId: ScenarioId,
  completedStepIds: number[]
): number {
  const scenario = getScenario(scenarioId);
  if (!scenario || scenario.steps.length === 0) return 0;
  const completed = scenario.steps.filter(s => completedStepIds.includes(s.id)).length;
  return Math.round((completed / scenario.steps.length) * 100);
}

/** Determine if scenario requires immediate action */
export function isUrgent(id: ScenarioId): boolean {
  const scenario = getScenario(id);
  return scenario?.riskLevel === 'high';
}

/** Get all scenario IDs */
export function getScenarioIds(): ScenarioId[] {
  return Object.keys(SCENARIO_DATABASE) as ScenarioId[];
}

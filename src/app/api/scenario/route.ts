import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { validateScenarioId, sanitizeUserInput } from '@/lib/validators';
import { logAnalyticsEvent } from '@/lib/bigquery';

let ai: GoogleGenAI | null = null;
try {
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
} catch (e) {
  console.warn('Could not init GenAI:', e);
}

const SCENARIOS: Record<string, { title: string; description: string; steps: string[] }> = {
  'first-time-voter': {
    title: 'First-Time Voter Journey',
    description: 'A complete walkthrough of participating in your first election.',
    steps: [
      'Check eligibility (age, citizenship, residency)',
      'Register to vote at vote.gov or your state portal',
      'Confirm registration status 2 weeks before election',
      'Research your ballot — candidates, measures, judges',
      'Choose your voting method: Mail-In, Early Voting, or Election Day',
      'Gather required ID documents',
      'Cast your ballot and verify it was counted'
    ]
  },
  'missed-registration': {
    title: 'Missed Registration Deadline',
    description: 'Explore recovery paths when the standard registration deadline has passed.',
    steps: [
      'Check if your state offers Same-Day Voter Registration (SDR)',
      'If SDR: visit your polling place or early vote site with valid ID and proof of residency',
      'If no SDR: request a provisional ballot at your polling location',
      'Ask poll workers about affidavit ballot options',
      'Confirm provisional ballot was counted within 7 days via election office',
      'Register NOW for the next election to avoid this in future'
    ]
  },
  'mail-ballot': {
    title: 'Mail-In / Absentee Voting',
    description: 'Complete guide to alternative voting from home.',
    steps: [
      'Request a mail-in ballot by your state\'s deadline (typically 7-14 days before election)',
      'Receive ballot — verify all pages and instructions are included',
      'Research your ballot before filling it out',
      'Follow instructions exactly — use correct envelope, signature, witness if required',
      'Return by the deadline: drop box, mail, or in-person',
      'Track your ballot status via your state\'s ballot tracking tool'
    ]
  },
  'accessibility': {
    title: 'Accessibility & Accommodation Services',
    description: 'Voting with specific accessibility needs.',
    steps: [
      'Contact your county election office to register accessibility needs',
      'Request curbside voting, accessible voting machines, or audio ballot',
      'Bring an assistant or companion if needed (family, friend, or poll worker)',
      'Use AutoMark or other accessible voting devices at polling places',
      'Request absentee ballot if in-person voting is physically difficult',
      'File a complaint with local election board if accommodations are not met'
    ]
  }
};

const SCENARIO_PROMPT_PREFIX = `You are the Scenario Simulation Agent for Election Navigator AI. 
Enhance the following election scenario with personalized insights, key risks, and pro tips. 
Reply in a friendly, encouraging tone. Format with clear sections.`;

export async function POST(req: NextRequest) {
  try {
    const { scenarioId, userContext } = await req.json();

    // 1. Validate Scenario ID
    const idValidation = validateScenarioId(scenarioId);
    if (!idValidation.valid) {
      return NextResponse.json({ error: idValidation.error }, { status: 400 });
    }

    const scenario = SCENARIOS[scenarioId as string];
    const sanitizedContext = userContext ? sanitizeUserInput(userContext) : 'General first-time citizen';

    let aiInsights = '';

    if (ai) {
      const prompt = `${SCENARIO_PROMPT_PREFIX}\n\nScenario: ${scenario.title}\nSteps: ${scenario.steps.join(', ')}\nUser Context: ${sanitizedContext}`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { temperature: 0.4 }
      });
      aiInsights = response.text || '';
    } else {
      aiInsights = `Key Risk Alert: ${scenario.title} requires time-sensitive actions. Pro Tip: Always verify deadlines with your county election website as they vary by jurisdiction. Remember: Your vote counts — every election has been decided by thin margins.`;
    }

    // Log interaction to BigQuery
    await logAnalyticsEvent('scenario_triggered', {
      scenarioId: scenarioId,
      contextLength: sanitizedContext.length
    });

    return NextResponse.json({ scenario, aiInsights });
  } catch (err) {
    console.error('Scenario simulation error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ scenarios: Object.keys(SCENARIOS).map(id => ({ id, ...SCENARIOS[id] })) });
}


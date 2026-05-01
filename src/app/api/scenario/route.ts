import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Simplified sanitization
function sanitize(input: any): string {
  if (input === null || input === undefined) return '';
  return String(input).replace(/<[^>]*>/g, '').trim().substring(0, 2000);
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
      'Request a mail-in ballot by your state\'s deadline',
      'Receive ballot — verify all pages and instructions are included',
      'Research your ballot before filling it out',
      'Follow instructions exactly — use correct envelope and signature',
      'Return by the deadline: drop box, mail, or in-person',
      'Track your ballot status via your state\'s tracking tool'
    ]
  },
  'accessibility': {
    title: 'Accessibility & Accommodation Services',
    description: 'Voting with specific accessibility needs.',
    steps: [
      'Contact your county election office to register accessibility needs',
      'Request curbside voting or accessible voting machines',
      'Bring an assistant or companion if needed',
      'Use AutoMark or other accessible devices at polling places',
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

    if (!scenarioId || !SCENARIOS[scenarioId as string]) {
      return NextResponse.json({ error: 'Invalid scenario ID' }, { status: 400 });
    }

    const scenario = SCENARIOS[scenarioId as string];
    const sanitizedContext = sanitize(userContext) || 'General first-time citizen';

    const apiKey = process.env.GEMINI_API_KEY;
    let aiInsights = '';

    if (apiKey && apiKey.length > 10) {
      const genAI = new GoogleGenAI({ apiKey });
      const model = genAI.models.get("gemini-1.5-flash");
      const prompt = `${SCENARIO_PROMPT_PREFIX}\n\nScenario: ${scenario.title}\nSteps: ${scenario.steps.join(', ')}\nUser Context: ${sanitizedContext}`;
      
      const result = await model.generateContent(prompt);
      aiInsights = result.response.text();
    } else {
      aiInsights = `Key Risk Alert: ${scenario.title} requires time-sensitive actions. Pro Tip: Always verify deadlines with your county election website. Remember: Every election has been decided by thin margins. Your vote is your voice!`;
    }

    console.log(`[ScenarioAPI] Generated insights for ${scenarioId}`);
    return NextResponse.json({ scenario, aiInsights });
  } catch (err: any) {
    console.error('[ScenarioAPI] Error:', err);
    return NextResponse.json({ error: 'Internal server error', details: err?.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ scenarios: Object.keys(SCENARIOS).map(id => ({ id, ...SCENARIOS[id] })) });
}

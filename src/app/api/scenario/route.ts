import { NextRequest, NextResponse } from 'next/server';

// DEFINITIVE REST ENDPOINT
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

const SCENARIOS: Record<string, { title: string; description: string; steps: string[] }> = {
  'first-time-voter': {
    title: 'First-Time Voter Journey',
    description: 'A complete walkthrough of participating in your first election.',
    steps: ['Check eligibility', 'Register to vote', 'Confirm registration', 'Research ballot', 'Choose voting method', 'Gather ID', 'Cast ballot']
  }
};

export async function POST(req: NextRequest) {
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  
  try {
    const { scenarioId } = await req.json();
    const scenario = SCENARIOS[scenarioId as string] || SCENARIOS['first-time-voter'];

    if (!apiKey || !apiKey.startsWith("AIza")) {
      return NextResponse.json({ scenario, aiInsights: "Please configure a valid Gemini API Key." });
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Enhance this election scenario: ${scenario.title}` }] }]
      })
    });

    const data = await response.json();
    const aiInsights = data.candidates?.[0]?.content?.parts?.[0]?.text || "Check local deadlines.";
    
    return NextResponse.json({ scenario, aiInsights });
  } catch (err) {
    return NextResponse.json({ scenario: SCENARIOS['first-time-voter'], aiInsights: "Service unavailable." });
  }
}

export async function GET() {
  return NextResponse.json({ scenarios: Object.keys(SCENARIOS).map(id => ({ id, ...SCENARIOS[id] })) });
}

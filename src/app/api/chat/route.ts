import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Initialize the Gemini client if API key is available and valid
let ai: GoogleGenAI | null = null;
try {
  const key = process.env.GEMINI_API_KEY;
  if (key && key.length > 10) {
    ai = new GoogleGenAI({ apiKey: key });
    console.log("Chat API: Google Gen AI client initialized successfully.");
  } else {
    console.warn("Chat API: GEMINI_API_KEY is missing or invalid. Using simulated fallback mode.");
  }
} catch (e) {
  console.warn("Chat API: Could not initialize Google Gen AI client:", e);
}

const SYSTEM_PROMPT = `
You are the Election Navigator AI, a Google-powered Civic AI Copilot. 
Your goal is to provide clear, trustworthy, and accessible guidance on election processes.
- Be objective and non-partisan.
- Tailor advice to help users navigate "what-if" scenarios like missed deadlines or first-time voting.
- Explain things clearly, avoiding confusing legal jargon.
- Format responses clearly (you can use bullet points or short paragraphs).
- Emphasize that you are an AI assistant and users should always verify with official local election offices.
- IMPORTANT: If a user asks a general question (like "what is an election", "how do primaries work", etc.), answer it fully and generally. DO NOT demand their location for general educational questions.
- ONLY ask for their location if they ask a question where the answer strictly depends on local jurisdiction (e.g., specific deadlines, polling places, specific ID laws).
`;

// Simple sanitizer that doesn't need jsdom
function simpleSanitize(input: string): string {
  if (!input) return '';
  return input.replace(/<[^>]*>/g, '').trim().substring(0, 2000);
}

function detectInjection(input: string): boolean {
  const patterns = [
    /ignore (all |previous |above |prior )?instructions?/i,
    /you are now/i,
    /forget (your |all |previous )?instructions?/i,
    /jailbreak/i,
    /DAN(?:\s+mode)?/i,
    /system prompt/i,
  ];
  return patterns.some(p => p.test(input));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history, context } = body;

    // Validate
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }
    if (message.length > 2000) {
      return NextResponse.json({ error: 'Message too long' }, { status: 400 });
    }

    const sanitizedMessage = simpleSanitize(message);
    const sanitizedLocation = context?.location ? simpleSanitize(context.location) : 'unknown';
    const sanitizedActiveStep = context?.activeStep ? simpleSanitize(context.activeStep) : 'unknown';

    if (detectInjection(sanitizedMessage)) {
      return NextResponse.json({ 
        error: "Security validation failed.",
        reply: "I detected an unusual request pattern. Please ask questions related to civic and election processes."
      }, { status: 400 });
    }

    if (ai) {
      // Build conversation history for Gemini
      const formattedHistory = (history || []).map((msg: any) => ({
        role: msg.role === 'bot' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      })).filter((msg: any) => msg.role !== 'system');

      const contextStr = sanitizedLocation !== 'unknown' 
        ? `[System Note: User is in ${sanitizedLocation}. Active Step: ${sanitizedActiveStep}] ` 
        : `[System Note: Location unknown. Active Step: ${sanitizedActiveStep}] `;

      const result = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [
          { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
          { role: 'model', parts: [{ text: 'Understood. I will act as the Election Navigator AI.' }] },
          ...formattedHistory,
          { role: 'user', parts: [{ text: contextStr + sanitizedMessage }] }
        ],
        config: {
          temperature: 0.4,
        }
      });

      return NextResponse.json({ reply: result.text });
    } else {
      // Simulated fallback
      let reply = "I am the simulated Election Navigator AI. ";
      const lc = sanitizedMessage.toLowerCase();

      if (lc.includes("missed") && lc.includes("registration")) {
        reply += "If you missed the standard registration deadline, some states offer Same-Day Voter Registration during early voting or on Election Day.";
      } else if (lc.includes("first-time") || lc.includes("first time")) {
        reply += "Welcome to your first election! The process involves: 1) Registering to vote, 2) Deciding how to vote, and 3) Researching your ballot.";
      } else if (lc.includes("what is") && (lc.includes("election") || lc.includes("vote"))) {
        reply += "An election is a formal process by which a population chooses individuals to hold public office. Voting is the cornerstone of democracy.";
      } else {
        reply += `You asked: "${sanitizedMessage.substring(0, 40)}...". Election laws vary by state. What civic concept can I explain for you?`;
      }

      return NextResponse.json({ reply });
    }
  } catch (error: any) {
    console.error('Chat API error:', error?.message || error);
    return NextResponse.json(
      { error: 'Internal server error', reply: `Error: ${error?.message || 'Unknown error'}. Please try again.` }, 
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { 
  validateChatMessage, 
  validateConversationHistory, 
  sanitizeUserInput, 
  detectPromptInjection 
} from '@/lib/validators';
import { logAnalyticsEvent } from '@/lib/bigquery';

// Initialize the Gemini client if API key is available and valid
let ai: GoogleGenAI | null = null;
try {
  const key = process.env.GEMINI_API_KEY;
  if (key && key.startsWith('AIza')) {
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history, context } = body;

    // 1. Validate Input Structure
    const messageValid = validateChatMessage(message);
    if (!messageValid.valid) {
      return NextResponse.json({ error: messageValid.error }, { status: 400 });
    }

    const historyValid = validateConversationHistory(history || []);
    if (!historyValid.valid) {
      return NextResponse.json({ error: historyValid.error }, { status: 400 });
    }

    // 2. Sanitize and Security Check
    const sanitizedMessage = sanitizeUserInput(message);
    const sanitizedLocation = context?.location ? sanitizeUserInput(context.location) : 'unknown';
    const sanitizedActiveStep = context?.activeStep ? sanitizeUserInput(context.activeStep) : 'unknown';

    if (detectPromptInjection(sanitizedMessage)) {
      console.warn("Prompt injection attempt detected:", sanitizedMessage);
      await logAnalyticsEvent('security_alert', { type: 'prompt_injection', message: sanitizedMessage });
      return NextResponse.json({ 
        error: "Security validation failed. Please rephrase your request.",
        reply: "I detected an unusual request pattern and cannot fulfill it for security reasons. Please ask questions related to civic and election processes."
      }, { status: 400 });
    }

    // Log general interaction
    await logAnalyticsEvent('chat_interaction', { 
      messageLength: sanitizedMessage.length,
      location: sanitizedLocation,
      activeStep: sanitizedActiveStep
    });

    if (ai) {
      // Build conversation history for Gemini
      const formattedHistory = (history || []).map((msg: any) => ({
        role: msg.role === 'bot' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      })).filter((msg: any) => msg.role !== 'system');

      // Build contextual prefix
      const contextStr = sanitizedLocation !== 'unknown' 
        ? `[System Note: User is in ${sanitizedLocation}. Active Step: ${sanitizedActiveStep}] ` 
        : `[System Note: Location unknown. Active Step: ${sanitizedActiveStep}] `;

      // Call Gemini API with correct SDK usage
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
      // Simulated fallback response
      console.warn("GEMINI_API_KEY not set, using simulated AI response.");
      
      let reply = "I am the simulated Election Navigator AI. ";
      const lc = sanitizedMessage.toLowerCase();

      if (lc.includes("missed") && lc.includes("registration")) {
        reply += "If you missed the standard registration deadline, some states offer Same-Day Voter Registration (SDR) during early voting or on Election Day. You will likely need to cast a provisional ballot.";
      } else if (lc.includes("first-time") || lc.includes("first time")) {
        reply += "Welcome to your first election! The process involves 3 main steps: 1) Registering to vote, 2) Deciding how to vote (mail-in, early, or Election Day), and 3) Researching your ballot.";
      } else if (lc.includes("lost")) {
        reply += "If you lost your mail-in ballot, contact your local election office immediately. You can usually request a replacement ballot, or you can go to your polling place on Election Day and cast a provisional ballot.";
      } else if (lc.includes("what is") && (lc.includes("election") || lc.includes("vote") || lc.includes("primary") || lc.includes("democracy"))) {
        reply += "An election is a formal decision-making process by which a population chooses an individual or multiple individuals to hold public office. A primary election is a process where voters choose their party's candidate for the general election. Voting is the cornerstone of democracy, allowing citizens to have a voice in their government.";
      } else {
        if (sanitizedLocation !== 'unknown') {
          reply += `Since you are in ${sanitizedLocation}, I would normally look up specific deadlines and rules for you. Since I am in simulated fallback mode, please check the official ${sanitizedLocation} Secretary of State website for specific details regarding: "${sanitizedMessage.substring(0, 40)}..."`;
        } else {
          reply += `You asked: "${sanitizedMessage.substring(0, 40)}...". As a general rule, election laws vary heavily by state. If your question requires specific deadlines or polling locations, please tell me your state or country. Otherwise, what general civic concept can I explain for you?`;
        }
      }

      return NextResponse.json({ reply });
    }
  } catch (error) {
    console.error('Error processing chat:', error);
    return NextResponse.json(
      { error: 'Internal server error', reply: 'I encountered an error while processing your request. Please try again.' }, 
      { status: 500 }
    );
  }
}


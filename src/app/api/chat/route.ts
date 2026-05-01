import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { ChatRequest, ChatResponse } from '@/types';

// Initialize the Gemini client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.length < 10) return null;
  return new GoogleGenAI({ apiKey });
};

const SYSTEM_PROMPT = `
You are the Election Navigator AI, a Google-powered Civic AI Copilot. 
Your goal is to provide clear, trustworthy, and accessible guidance on election processes.
- Be objective and non-partisan.
- Tailor advice to help users navigate "what-if" scenarios like missed deadlines or first-time voting.
- Format responses clearly (use markdown, bullet points).
- Emphasize that you are an AI assistant and users should verify with official local election offices.
`;

/**
 * Sanitizes input and ensures it is a string to prevent 'replace is not a function' errors.
 */
function sanitize(input: any): string {
  if (input === null || input === undefined) return '';
  const str = String(input);
  return str.replace(/<[^>]*>/g, '').trim().substring(0, 2000);
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequest = await req.json();
    const { message, history, context } = body;

    // 1. Validation
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Valid message string is required' }, { status: 400 });
    }

    const cleanMessage = sanitize(message);
    const cleanLocation = sanitize(context?.location);
    const cleanStep = sanitize(context?.activeStep);

    console.log(`[ChatAPI] Processing message. Context: ${cleanLocation}, Step: ${cleanStep}`);

    const ai = getGeminiClient();

    if (ai) {
      const model = ai.models.get("gemini-1.5-flash");
      
      const formattedHistory = (history || []).map(msg => ({
        role: msg.role === 'bot' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      })).filter(msg => msg.role !== 'system');

      const contextNote = `[User Context: Location=${cleanLocation || 'Global'}, Step=${cleanStep}] `;

      const result = await model.generateContent({
        contents: [
          { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
          { role: 'model', parts: [{ text: 'Understood. I will act as the Election Navigator AI.' }] },
          ...formattedHistory,
          { role: 'user', parts: [{ text: contextNote + cleanMessage }] }
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 1000,
        }
      });

      const responseText = result.response.text();
      return NextResponse.json({ reply: responseText } as ChatResponse);
    } else {
      // Robust Fallback Mode
      console.warn("[ChatAPI] API Key missing, using fallback.");
      const reply = generateFallbackResponse(cleanMessage, cleanLocation);
      return NextResponse.json({ reply } as ChatResponse);
    }

  } catch (error: any) {
    console.error('[ChatAPI] Fatal error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        reply: "I'm having trouble connecting to my brain right now. Please check your internet or try again in a moment." 
      } as ChatResponse, 
      { status: 500 }
    );
  }
}

function generateFallbackResponse(message: string, location: string): string {
  const lc = message.toLowerCase();
  let response = "I am currently in high-security offline mode. ";
  
  if (lc.includes("register")) {
    response += "To register, most jurisdictions require you to be 18+ and a citizen. Check your local Secretary of State website.";
  } else if (lc.includes("deadline")) {
    response += "Deadlines vary by state. Many require registration 30 days before an election.";
  } else {
    response += `I received your message about "${message.substring(0, 30)}...". For specific guidance in ${location || 'your area'}, please ensure the Gemini API key is configured correctly in the environment.`;
  }
  
  return response;
}

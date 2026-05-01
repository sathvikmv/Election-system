import { NextRequest, NextResponse } from 'next/server';

// DEFINITIVE REST ENDPOINT
const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export async function POST(req: NextRequest) {
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  
  if (!apiKey || !apiKey.startsWith("AIza")) {
    return NextResponse.json({ 
      reply: "⚠️ SYSTEM ALERT: Invalid API Key detected. Please ensure you are using a Gemini API Key from Google AI Studio (starting with 'AIza')." 
    });
  }

  try {
    const body = await req.json();
    const contents = [
      ...(body.history || []).map((msg: any) => ({
        role: msg.role === 'bot' ? 'model' : 'user',
        parts: [{ text: String(msg.content) }]
      })),
      { role: 'user', parts: [{ text: String(body.message) }] }
    ];

    const response = await fetch(`${ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API Error:", data);
      return NextResponse.json({ 
        reply: `⚠️ API Error (${response.status}): ${data.error?.message || "Check your API key restrictions."}` 
      });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response.";
    return NextResponse.json({ reply });

  } catch (error: any) {
    console.error('[ChatAPI] Fatal Error:', error.message);
    return NextResponse.json({ reply: "Connection timed out. Please try again." });
  }
}

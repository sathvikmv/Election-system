import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { validateConversationHistory } from '@/lib/validators';
import { analyzeConversationRisk, buildTrustReport } from '@/lib/trustEngine';
import { logAnalyticsEvent } from '@/lib/bigquery';

let ai: GoogleGenAI | null = null;
try {
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
} catch (e) {
  console.warn('Could not init GenAI:', e);
}

const TRUST_SYSTEM_PROMPT = `
You are the Trust Reporting Agent for Election Navigator AI.
Analyze the conversation quality and generate a structured JSON trust report.
Rate: Accuracy (0-100), Clarity (0-100), Bias Risk (0-100, lower is better), Completeness (0-100).
Always include a short recommendation string.
Reply ONLY with valid JSON.
`;

export async function POST(req: NextRequest) {
  try {
    const { conversation } = await req.json();

    // 1. Validate Conversation History
    const historyValid = validateConversationHistory(conversation);
    if (!historyValid.valid) {
      return NextResponse.json({ error: historyValid.error }, { status: 400 });
    }

    if (ai) {
      const conversationText = conversation
        .map((m: any) => `${m.role.toUpperCase()}: ${m.content}`)
        .join('\n');

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: [
          { role: 'user', parts: [{ text: TRUST_SYSTEM_PROMPT }] },
          { role: 'model', parts: [{ text: 'Ready to generate trust report as JSON.' }] },
          {
            role: 'user',
            parts: [{ text: `Analyze this civic guidance conversation:\n${conversationText}` }]
          }
        ],
        config: { temperature: 0.1 }
      });

      let jsonText = response.text || '{}';
      // Strip markdown code fences if Gemini wraps in them
      jsonText = jsonText.replace(/```json|```/g, '').trim();
      const report = JSON.parse(jsonText);
      return NextResponse.json({ report });
    }

    // Simulated fallback: Calculate dynamic scores based on real conversation text
    const riskAnalysis = analyzeConversationRisk(conversation);
    
    // Base scores
    let accuracy = 96;
    let clarity = 94;
    let biasRisk = 4;
    let completeness = 90;

    // Adjust based on conversation
    if (riskAnalysis.hasPartisanContent) {
      biasRisk += 25;
      accuracy -= 10;
    }
    if (riskAnalysis.hasUnsafeContent) {
      biasRisk += 40;
      accuracy -= 20;
    }
    
    if (riskAnalysis.avgResponseLength < 50) {
      completeness -= 15;
      clarity -= 5;
    } else if (riskAnalysis.avgResponseLength > 300) {
      clarity -= 10; // Too long might be unclear
      completeness += 5;
    }

    if (riskAnalysis.questionCount > 5) {
      completeness += 5; // Long convo means thorough
    }

    // Ensure bounds
    accuracy = Math.min(100, Math.max(0, accuracy));
    clarity = Math.min(100, Math.max(0, clarity));
    biasRisk = Math.min(100, Math.max(0, biasRisk));
    completeness = Math.min(100, Math.max(0, completeness));

    const report = buildTrustReport(accuracy, clarity, biasRisk, completeness);

    await logAnalyticsEvent('trust_score_generated', {
      score: report.overallTrustScore,
      biasRisk: report.biasRisk,
      conversationLength: conversation.length
    });

    return NextResponse.json({ report });
  } catch (err) {
    console.error('Trust report error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}


/**
 * @jest-environment node
 *
 * chat.test.ts — API Route Tests
 * Requires node environment because NextRequest uses the Web Fetch API
 * which is available in Node 18+ but not in jsdom.
 */

import { NextRequest } from 'next/server';
import { POST } from '../src/app/api/chat/route';

// Mock the NextRequest
const mockRequest = (body: any) => {
  return new NextRequest('http://localhost/api/chat', {
    method: 'POST',
    body: JSON.stringify(body),
  });
};

describe('Chat API Endpoint', () => {
  it('should return 400 if message is missing', async () => {
    const req = mockRequest({ history: [] });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Message is required');
  });

  it('should return simulated response for missed registration', async () => {
    const req = mockRequest({ 
      message: 'I missed my registration deadline', 
      history: [] 
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.reply).toContain('Same-Day Voter Registration');
  });

  it('should return simulated response for first-time voter', async () => {
    const req = mockRequest({ 
      message: 'I am a first-time voter, what do I do?', 
      history: [] 
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.reply).toContain('Welcome to your first election');
  });
});

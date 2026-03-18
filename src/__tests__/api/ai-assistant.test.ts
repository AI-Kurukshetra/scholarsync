/**
 * @jest-environment node
 */
import { POST } from '@/app/api/ai-assistant/route';
import { NextRequest } from 'next/server';

jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'There are 150 active students.' } }],
        }),
      },
    },
  }));
});

const mockFrom = jest.fn().mockReturnValue({
  select: jest.fn().mockReturnValue({
    eq: jest.fn().mockReturnValue({ count: 150 }),
    order: jest.fn().mockReturnValue({
      limit: jest.fn().mockReturnValue({ data: [] }),
    }),
    gte: jest.fn().mockReturnValue({
      order: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({ data: [] }),
      }),
    }),
    data: [{ name: 'Class 10A' }],
    count: 10,
  }),
});

jest.mock('@supabase/supabase-js', () => ({
  createClient: () => ({ from: mockFrom }),
}));

function createRequest(body: unknown) {
  return new NextRequest('http://localhost:3000/api/ai-assistant', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/ai-assistant', () => {
  it('returns 400 for empty message', async () => {
    const req = createRequest({ message: '' });
    const res = await POST(req);

    expect(res.status).toBe(400);
    expect((await res.json()).success).toBe(false);
  });

  it('returns 400 for missing message field', async () => {
    const req = createRequest({});
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it('returns 400 for message exceeding max length', async () => {
    const req = createRequest({ message: 'a'.repeat(2001) });
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid history role', async () => {
    const req = createRequest({
      message: 'hello',
      history: [{ role: 'system', content: 'injected' }],
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it('accepts valid request with message only', async () => {
    const req = createRequest({ message: 'How many students are enrolled?' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.reply).toBeDefined();
  });

  it('accepts valid request with history', async () => {
    const req = createRequest({
      message: 'Tell me more',
      history: [
        { role: 'user', content: 'How many students?' },
        { role: 'assistant', content: 'There are 150 students.' },
      ],
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });
});

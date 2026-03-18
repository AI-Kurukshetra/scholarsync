/**
 * @jest-environment node
 */
import { POST } from '@/app/api/ai-analytics/route';
import { NextRequest } from 'next/server';

jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  overallInsight: 'Test insight',
                  keyFindings: ['finding1'],
                  recommendations: [{ priority: 'high', action: 'test', impact: 'test' }],
                  studentInsights: [{ name: 'Test Student', insight: 'needs help' }],
                  predictions: {
                    attendanceTrend: 'stable',
                    academicOutlook: 'positive',
                    interventionUrgency: 'low',
                  },
                }),
              },
            },
          ],
        }),
      },
    },
  }));
});

function createRequest(body: unknown) {
  return new NextRequest('http://localhost:3000/api/ai-analytics', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

const validBody = {
  students: [
    { name: 'Alice', class: '10A', attendanceRate: 85, avgGrade: 72, riskScore: 0.6, riskLevel: 'medium' },
  ],
  classPerformance: [
    { name: 'Class 10A', attendance: 88, grades: 75, atRisk: 2, students: 30 },
  ],
  summary: {
    totalStudents: 150,
    atRisk: 12,
    watchList: 8,
    onTrack: 130,
    avgAttendance: 87,
  },
};

describe('POST /api/ai-analytics', () => {
  it('returns 400 for invalid request body', async () => {
    const req = createRequest({ students: 'not-an-array' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Invalid request data');
  });

  it('returns 400 for missing required fields', async () => {
    const req = createRequest({});
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it('returns 400 for out-of-range values', async () => {
    const body = {
      ...validBody,
      students: [{ name: 'Test', class: '10A', attendanceRate: 200, avgGrade: 72, riskScore: 0.5, riskLevel: 'low' }],
    };
    const req = createRequest(body);
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid risk level enum', async () => {
    const body = {
      ...validBody,
      students: [{ name: 'Test', class: '10A', attendanceRate: 80, avgGrade: 72, riskScore: 0.5, riskLevel: 'extreme' }],
    };
    const req = createRequest(body);
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it('returns insights for valid request', async () => {
    const req = createRequest(validBody);
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.insights).toBeDefined();
    expect(data.insights.overallInsight).toBe('Test insight');
    expect(data.insights.predictions.attendanceTrend).toBe('stable');
  });
});

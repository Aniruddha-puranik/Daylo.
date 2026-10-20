import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../app/api/assistant/route';

const request = (body: unknown) => new NextRequest('http://localhost/api/assistant', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
const originalKey = process.env.OPENROUTER_API_KEY;
const originalModel = process.env.OPENROUTER_MODEL;
afterEach(() => { vi.unstubAllGlobals(); if (originalKey === undefined) delete process.env.OPENROUTER_API_KEY; else process.env.OPENROUTER_API_KEY = originalKey; if (originalModel === undefined) delete process.env.OPENROUTER_MODEL; else process.env.OPENROUTER_MODEL = originalModel; });

describe('OpenRouter assistant endpoint', () => {
  it('returns a safe setup response when the server key is missing', async () => {
    delete process.env.OPENROUTER_API_KEY;
    const response = await POST(request({ messages: [] }));
    expect(response.status).toBe(503);
    expect((await response.json()).error).toContain('not configured');
  });
  it('rejects malformed and oversized conversations', async () => {
    process.env.OPENROUTER_API_KEY = 'test-only';
    expect((await POST(request({ messages: 'nope' }))).status).toBe(400);
    expect((await POST(request({ messages: Array(21).fill({ role: 'user', content: 'hi' }) }))).status).toBe(400);
  });
  it('allows only configured free models and returns provider text', async () => {
    process.env.OPENROUTER_API_KEY = 'test-only';
    process.env.OPENROUTER_MODEL = 'paid/model';
    expect((await POST(request({ messages: [{ role: 'user', content: 'hello' }] }))).status).toBe(400);
    process.env.OPENROUTER_MODEL = 'nvidia/nemotron-3.5-lightning:free';
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ model: 'minimax/minimax-m3.1-flash:free', choices: [{ message: { content: 'A kind reply' } }] }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const response = await POST(request({ messages: [{ role: 'user', content: 'hello' }], model: 'minimax/minimax-m3.1-flash:free', context: { tasks: [] } }));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ reply: 'A kind reply', model: 'minimax/minimax-m3.1-flash:free' });
    const routedRequest=JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(routedRequest.model).toBeUndefined();
    expect(routedRequest.models[0]).toBe('minimax/minimax-m3.1-flash:free');
    expect(routedRequest.models).toHaveLength(3);
    expect(routedRequest.provider).toEqual({sort:{by:'latency',partition:'none'},max_price:{prompt:0,completion:0}});
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer test-only');
  });
  it('reports provider timeouts with a gateway timeout response', async () => {
    process.env.OPENROUTER_API_KEY='test-only';
    vi.stubGlobal('fetch',vi.fn().mockRejectedValue(Object.assign(new Error('timeout'),{name:'AbortError'})));
    const response=await POST(request({messages:[{role:'user',content:'hello'}]}));
    expect(response.status).toBe(504);
    expect((await response.json()).error).toContain('timed out');
  });
  it('returns safe provider failure text for rate limits', async () => {
    process.env.OPENROUTER_API_KEY = 'test-only';
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 429 })));
    const response = await POST(request({ messages: [{ role: 'user', content: 'hello' }] }));
    expect(response.status).toBe(429);
    expect((await response.json()).error).toContain('All available free models are busy');
  });
  it('puts the selected model first and allows free-model fallbacks', async () => {
    process.env.OPENROUTER_API_KEY='test-only';
    const fetchMock=vi.fn().mockResolvedValue(new Response(JSON.stringify({model:'google/gemma-4-26b-a4b-it:free',choices:[{message:{content:'Fallback reply'}}]}),{status:200}));
    vi.stubGlobal('fetch',fetchMock);
    const response=await POST(request({messages:[{role:'user',content:'hello'}],model:'google/gemma-4-31b-it:free'}));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({reply:'Fallback reply',model:'google/gemma-4-26b-a4b-it:free'});
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const routedRequest=JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(routedRequest.model).toBeUndefined();
    expect(routedRequest.models[0]).toBe('google/gemma-4-31b-it:free');
    expect(routedRequest.models).toContain('minimax/minimax-m3.1-flash:free');
  });
  it('retries another free model when a successful upstream response is empty', async () => {
    process.env.OPENROUTER_API_KEY='test-only';
    const fetchMock=vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({model:'minimax/minimax-m3.1-flash:free',choices:[{message:{content:null}}]}),{status:200}))
      .mockResolvedValueOnce(new Response(JSON.stringify({model:'nvidia/nemotron-3.5-lightning:free',choices:[{message:{content:'A fallback answer'}}]}),{status:200}));
    vi.stubGlobal('fetch',fetchMock);
    const response=await POST(request({messages:[{role:'user',content:'hello'}],model:'minimax/minimax-m3.1-flash:free'}));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({reply:'A fallback answer',model:'nvidia/nemotron-3.5-lightning:free'});
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).models).not.toContain('minimax/minimax-m3.1-flash:free');
  });
  it('explains when OpenRouter rejects the configured key without exposing it', async () => {
    process.env.OPENROUTER_API_KEY='secret-test-only';
    vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response('{}',{status:401})));
    const response=await POST(request({messages:[{role:'user',content:'hello'}]}));
    const data=await response.json();
    expect(response.status).toBe(502);
    expect(data.error).toContain('rejected the server API key');
    expect(data.error).not.toContain('secret-test-only');
  });
});

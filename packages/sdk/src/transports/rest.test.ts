import { describe, expect, it, vi } from 'vitest';
import { RestTransport } from './rest.js';
import type { FetchLike } from '../http/http-client.js';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('RestTransport', () => {
  it('initializes against /runtime/:attemptId/initialize', async () => {
    const fetchMock = vi.fn<FetchLike>(async () =>
      jsonResponse({
        attemptId: 'a1',
        version: 'SCORM_2004_4',
        cmi: { 'cmi.completion_status': 'incomplete' },
        learner: { id: 'l-1', name: 'Ada' },
        entry: 'resume',
      }),
    );

    const t = new RestTransport({
      baseUrl: 'https://api.example.com/api/v1',
      apiKey: 'k',
      fetch: fetchMock,
      retries: 0,
    });
    const state = await t.initialize('a1');

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe('https://api.example.com/api/v1/runtime/a1/initialize');
    expect(init.method).toBe('POST');
    expect(state.version).toBe('SCORM_2004_4');
    expect(state.cmi['cmi.completion_status']).toBe('incomplete');
    expect(state.learner).toEqual({ id: 'l-1', name: 'Ada' });
    expect(state.entry).toBe('resume');
  });

  it('url-encodes the attempt id', async () => {
    const fetchMock = vi.fn<FetchLike>(async () =>
      jsonResponse({ attemptId: 'a/1', version: 'SCORM_1_2', cmi: {} }),
    );
    const t = new RestTransport({ baseUrl: 'https://x/v1', fetch: fetchMock, retries: 0 });
    await t.initialize('a/1');
    expect(fetchMock.mock.calls[0]![0]).toBe('https://x/v1/runtime/a%2F1/initialize');
  });

  it('sends commit batch with sessionTimeDeltaSeconds', async () => {
    const fetchMock = vi.fn<FetchLike>(async () =>
      jsonResponse({ ok: true, committedAt: '2026-01-01T00:00:00Z', attempt: {} }),
    );
    const t = new RestTransport({ baseUrl: 'https://x/v1', fetch: fetchMock, retries: 0 });
    const result = await t.commit('a1', { 'cmi.suspend_data': 's' }, { sessionTimeDeltaSeconds: 30 });
    expect(result.ok).toBe(true);
    expect(result.committedAt).toBe('2026-01-01T00:00:00Z');
    const init = fetchMock.mock.calls[0]![1];
    expect(JSON.parse(init.body as string)).toEqual({
      values: { 'cmi.suspend_data': 's' },
      sessionTimeDeltaSeconds: 30,
    });
  });

  it('surfaces warnings from the commit response when present', async () => {
    const fetchMock = vi.fn<FetchLike>(async () =>
      jsonResponse({
        ok: true,
        committedAt: 'now',
        attempt: {},
        warnings: [{ code: 'unknown_key', key: 'cmi.bogus', message: 'huh' }],
      }),
    );
    const t = new RestTransport({ baseUrl: 'https://x/v1', fetch: fetchMock, retries: 0 });
    const result = await t.commit('a1', {});
    expect(result.warnings).toEqual([
      { code: 'unknown_key', key: 'cmi.bogus', message: 'huh' },
    ]);
  });

  it('omits body on terminate when no values are passed', async () => {
    const fetchMock = vi.fn<FetchLike>(async () => jsonResponse({ attempt: {} })) satisfies FetchLike;
    const t = new RestTransport({ baseUrl: 'https://x/v1', fetch: fetchMock, retries: 0 });
    await t.terminate('a1');
    const init = fetchMock.mock.calls[0]![1];
    expect(init.body).toBeUndefined();
  });

  it('sends final values on terminate when provided', async () => {
    const fetchMock = vi.fn<FetchLike>(async () => jsonResponse({ attempt: {} })) satisfies FetchLike;
    const t = new RestTransport({ baseUrl: 'https://x/v1', fetch: fetchMock, retries: 0 });
    await t.terminate('a1', { 'cmi.core.lesson_status': 'completed' });
    const init = fetchMock.mock.calls[0]![1];
    expect(JSON.parse(init.body as string)).toEqual({
      values: { 'cmi.core.lesson_status': 'completed' },
    });
  });
});

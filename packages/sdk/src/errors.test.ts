import { describe, expect, it } from 'vitest';
import {
  ScormError,
  ScormHttpError,
  ScormNetworkError,
  ScormTimeoutError,
  ScormAbortError,
  isRetryableStatus,
} from './errors.js';

describe('ScormError', () => {
  it('is an Error subclass with the correct name', () => {
    const e = new ScormError('boom');
    expect(e).toBeInstanceOf(Error);
    expect(e.name).toBe('ScormError');
    expect(e.message).toBe('boom');
  });

  it('attaches the cause when provided', () => {
    const cause = new Error('underlying');
    const e = new ScormError('boom', { cause });
    expect((e as Error & { cause?: unknown }).cause).toBe(cause);
  });
});

describe('ScormHttpError', () => {
  it('lifts code, requestId, and details from the response body', () => {
    const e = new ScormHttpError(
      404,
      { code: 'course_not_found', message: 'no such course', requestId: 'req-1', details: { id: 'x' } },
      'fallback',
      { code: 'course_not_found' },
    );
    expect(e.status).toBe(404);
    expect(e.code).toBe('course_not_found');
    expect(e.message).toBe('no such course');
    expect(e.requestId).toBe('req-1');
    expect(e.details).toEqual({ id: 'x' });
    expect(e.name).toBe('ScormHttpError');
  });

  it('falls back to fallbackMessage and `http_<status>` code when body is missing fields', () => {
    const e = new ScormHttpError(500, undefined, 'POST /x → 500');
    expect(e.code).toBe('http_500');
    expect(e.message).toBe('POST /x → 500');
    expect(e.requestId).toBeUndefined();
    expect(e.details).toBeUndefined();
  });

  it('preserves the raw body for inspection', () => {
    const raw = { code: 'oops', extra: 'field' };
    const e = new ScormHttpError(500, raw, 'fallback', raw);
    expect(e.body).toBe(raw);
  });
});

describe('ScormNetworkError', () => {
  it('captures the original cause', () => {
    const cause = new TypeError('fetch failed');
    const e = new ScormNetworkError('network down', cause);
    expect(e.name).toBe('ScormNetworkError');
    expect((e as Error & { cause?: unknown }).cause).toBe(cause);
  });

  it('works without a cause', () => {
    const e = new ScormNetworkError('network down');
    expect((e as Error & { cause?: unknown }).cause).toBeUndefined();
  });
});

describe('ScormTimeoutError', () => {
  it('reports the timeout in the message and exposes timeoutMs', () => {
    const e = new ScormTimeoutError(5000);
    expect(e.name).toBe('ScormTimeoutError');
    expect(e.timeoutMs).toBe(5000);
    expect(e.message).toMatch(/5000ms/);
  });
});

describe('ScormAbortError', () => {
  it('has a fixed message and name', () => {
    const e = new ScormAbortError();
    expect(e.name).toBe('ScormAbortError');
    expect(e.message).toBe('Request was aborted');
  });
});

describe('isRetryableStatus', () => {
  it('marks 408, 429, and 5xx as retryable', () => {
    expect(isRetryableStatus(408)).toBe(true);
    expect(isRetryableStatus(429)).toBe(true);
    expect(isRetryableStatus(500)).toBe(true);
    expect(isRetryableStatus(503)).toBe(true);
    expect(isRetryableStatus(599)).toBe(true);
  });

  it('marks 2xx, 3xx, and other 4xx as non-retryable', () => {
    expect(isRetryableStatus(200)).toBe(false);
    expect(isRetryableStatus(301)).toBe(false);
    expect(isRetryableStatus(400)).toBe(false);
    expect(isRetryableStatus(401)).toBe(false);
    expect(isRetryableStatus(404)).toBe(false);
    expect(isRetryableStatus(422)).toBe(false);
  });
});

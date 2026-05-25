export interface BackoffOptions {
  baseMs: number;
  maxMs: number;
  attempt: number;
  jitter?: boolean;
  random?: () => number;
}

export function computeBackoff(opts: BackoffOptions): number {
  const { baseMs, maxMs, attempt, jitter = true, random = Math.random } = opts;
  const exp = Math.min(maxMs, baseMs * 2 ** Math.max(0, attempt - 1));
  if (!jitter) return exp;
  return Math.floor(random() * exp);
}

export function parseRetryAfter(header: string | null, now: () => number = Date.now): number | null {
  if (!header) return null;
  const seconds = Number(header);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const epoch = Date.parse(header);
  if (Number.isFinite(epoch)) return Math.max(0, epoch - now());
  return null;
}

export function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason instanceof Error ? signal.reason : new Error('aborted'));
      return;
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(signal?.reason instanceof Error ? signal.reason : new Error('aborted'));
    };
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

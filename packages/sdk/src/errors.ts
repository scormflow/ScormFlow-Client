export interface ScormErrorBody {
  code?: string;
  message?: string;
  details?: Record<string, unknown>;
  requestId?: string;
}

export class ScormError extends Error {
  override readonly name: string = 'ScormError';
  constructor(message: string, options?: { cause?: unknown }) {
    super(message);
    if (options?.cause !== undefined) {
      (this as { cause?: unknown }).cause = options.cause;
    }
  }
}

export class ScormHttpError extends ScormError {
  override readonly name = 'ScormHttpError';
  readonly status: number;
  readonly code: string;
  readonly requestId?: string;
  readonly details?: Record<string, unknown>;
  readonly body?: unknown;

  constructor(
    status: number,
    body: ScormErrorBody | undefined,
    fallbackMessage: string,
    raw?: unknown,
  ) {
    super(body?.message ?? fallbackMessage);
    this.status = status;
    this.code = body?.code ?? `http_${status}`;
    if (body?.requestId !== undefined) this.requestId = body.requestId;
    if (body?.details !== undefined) this.details = body.details;
    if (raw !== undefined) this.body = raw;
  }
}

export class ScormNetworkError extends ScormError {
  override readonly name = 'ScormNetworkError';
  constructor(message: string, cause?: unknown) {
    super(message, cause !== undefined ? { cause } : undefined);
  }
}

export class ScormTimeoutError extends ScormError {
  override readonly name = 'ScormTimeoutError';
  readonly timeoutMs: number;
  constructor(timeoutMs: number) {
    super(`Request timed out after ${timeoutMs}ms`);
    this.timeoutMs = timeoutMs;
  }
}

export class ScormAbortError extends ScormError {
  override readonly name = 'ScormAbortError';
  constructor() {
    super('Request was aborted');
  }
}

export function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 429 || (status >= 500 && status <= 599);
}

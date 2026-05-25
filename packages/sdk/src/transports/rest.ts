import { HttpClient, type HttpClientOptions } from '../http/http-client.js';
import type {
  CommitOptions,
  CommitResult,
  CommitWarning,
  RuntimeState,
  ScormLearner,
  ScormTransport,
  ScormVersion,
  ScormEntry,
  TerminateOptions,
} from '../transport.js';

export type RestTransportOptions = HttpClientOptions;

interface RuntimeStateDto {
  attemptId: string;
  version: ScormVersion;
  cmi: Record<string, unknown>;
  learner?: { id: string; name?: string | null };
  entry?: ScormEntry;
}

interface CommitResponseDto {
  ok: boolean;
  committedAt: string;
  warnings?: CommitWarning[];
  // attempt: Attempt — intentionally ignored by the transport; resource layer surfaces it.
}

/**
 * Talks to a `scorm-engine` backend's `/runtime/{attemptId}/*` endpoints.
 *
 * The `HttpClient` instance is exposed via {@link RestTransport.http} so the
 * SDK's resource layer (courses, attempts, analytics — Day 2) can reuse the
 * same auth + retry configuration.
 */
export class RestTransport implements ScormTransport {
  readonly http: HttpClient;

  constructor(opts: RestTransportOptions | HttpClient) {
    this.http = opts instanceof HttpClient ? opts : new HttpClient(opts);
  }

  async initialize(attemptId: string, options?: { signal?: AbortSignal }): Promise<RuntimeState> {
    const dto = await this.http.post<RuntimeStateDto>(
      `runtime/${encodeURIComponent(attemptId)}/initialize`,
      undefined,
      options?.signal ? { signal: options.signal } : {},
    );
    const result: RuntimeState = {
      attemptId: dto.attemptId,
      version: dto.version,
      cmi: dto.cmi ?? {},
    };
    if (dto.learner) {
      const learner: ScormLearner = { id: dto.learner.id };
      if (dto.learner.name != null) learner.name = dto.learner.name;
      result.learner = learner;
    }
    if (dto.entry !== undefined) result.entry = dto.entry;
    return result;
  }

  async commit(
    attemptId: string,
    values: Record<string, unknown>,
    options?: CommitOptions,
  ): Promise<CommitResult> {
    const body: { values: Record<string, unknown>; sessionTimeDeltaSeconds?: number } = { values };
    if (options?.sessionTimeDeltaSeconds !== undefined) {
      body.sessionTimeDeltaSeconds = options.sessionTimeDeltaSeconds;
    }
    const dto = await this.http.post<CommitResponseDto>(
      `runtime/${encodeURIComponent(attemptId)}/commit`,
      body,
      options?.signal ? { signal: options.signal } : {},
    );
    const result: CommitResult = { ok: dto.ok, committedAt: dto.committedAt };
    if (dto.warnings && dto.warnings.length > 0) result.warnings = dto.warnings;
    return result;
  }

  async terminate(
    attemptId: string,
    values?: Record<string, unknown>,
    options?: TerminateOptions,
  ): Promise<void> {
    const body = values ? { values } : undefined;
    await this.http.post<{ attempt: unknown }>(
      `runtime/${encodeURIComponent(attemptId)}/terminate`,
      body,
      options?.signal ? { signal: options.signal } : {},
    );
  }
}

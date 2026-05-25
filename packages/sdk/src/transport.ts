export type ScormVersion =
  | 'SCORM_1_2'
  | 'SCORM_2004_2'
  | 'SCORM_2004_3'
  | 'SCORM_2004_4';

export type ScormEntry = 'ab_initio' | 'resume' | '';

export interface ScormLearner {
  id: string;
  name?: string | null;
}

export interface RuntimeState {
  attemptId: string;
  version: ScormVersion;
  /**
   * Full CMI snapshot keyed by SCORM-native paths (e.g. `cmi.core.lesson_status`).
   * Empty for a new attempt; populated for a resume.
   */
  cmi: Record<string, unknown>;
  learner?: ScormLearner;
  entry?: ScormEntry;
}

export interface CommitOptions {
  /** Session-time delta in seconds since the last commit. */
  sessionTimeDeltaSeconds?: number;
  signal?: AbortSignal;
}

export interface CommitWarning {
  code:
    | 'unknown_key'
    | 'read_only_key'
    | 'invalid_value_type'
    | 'out_of_range'
    | 'invalid_format'
    | 'version_mismatch'
    | (string & {});
  key: string;
  value?: unknown;
  message: string;
}

export interface CommitResult {
  ok: boolean;
  committedAt?: string;
  warnings?: CommitWarning[];
}

export interface TerminateOptions {
  signal?: AbortSignal;
}

export interface ScormTransport {
  initialize(attemptId: string, options?: { signal?: AbortSignal }): Promise<RuntimeState>;
  commit(
    attemptId: string,
    values: Record<string, unknown>,
    options?: CommitOptions,
  ): Promise<CommitResult>;
  terminate(
    attemptId: string,
    values?: Record<string, unknown>,
    options?: TerminateOptions,
  ): Promise<void>;
}

/**
 * Public type surface for `@scormflow/types`.
 *
 * The `paths` and `components` interfaces are generated from the backend's
 * OpenAPI spec by `pnpm run types:generate` at the workspace root. The named
 * aliases below give consumers stable, ergonomic names without forcing them to
 * index into `components['schemas']` everywhere.
 */
export type { components, paths, operations } from './openapi.js';
import type { components } from './openapi.js';

type Schemas = components['schemas'];

export type Course = Schemas['Course'];
export type Sco = Schemas['Sco'];
export type ManifestMetadata = Schemas['ManifestMetadata'];
export type CourseListResponse = Schemas['CourseListResponse'];
export type ValidationReport = Schemas['ValidationReport'];

export type Attempt = Schemas['Attempt'];
export type Score = Schemas['Score'];

export type RuntimeState = Schemas['RuntimeState'];
export type CommitRequest = Schemas['CommitRequest'];
export type CommitResponse = Schemas['CommitResponse'];
export type CommitWarning = Schemas['CommitWarning'];

export type AnalyticsOverview = Schemas['AnalyticsOverview'];
export type CourseAnalytics = Schemas['CourseAnalytics'];
export type LearnerAnalytics = Schemas['LearnerAnalytics'];

export type ApiError = Schemas['Error'];
export type Pagination = Schemas['Pagination'];
export type ScormVersion = Schemas['ScormVersion'];

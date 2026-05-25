# Copilot Review Instructions

This file gives GitHub Copilot context when it reviews pull requests in this repo. Keep it short and concrete — long lists produce noisy reviews.

## What this repo is

ScormFlow Client — the frontend half of a SCORM 1.2 / 2004 runtime stack. Sibling to [`scormflow/server`](https://github.com/scormflow/server) (backend). pnpm workspace publishing four packages under the `@scormflow` npm scope:

- `@scormflow/sdk` — framework-agnostic TypeScript client, built around a pluggable `ScormTransport` interface
- `@scormflow/types` — types generated from the backend's OpenAPI spec
- `@scormflow/player` — vanilla-JS iframe player + SCORM runtime bridge
- `@scormflow/react` — React hooks + `<ScormPlayer/>` component

The two repos are decoupled by the versioned REST contract — the SDK works with any backend via a custom `ScormTransport`, and the backend works with any HTTP client.

## Tech stack

- TypeScript (strict, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`)
- Node 20+, pnpm workspaces
- tsup for builds (ESM + CJS + .d.ts dual output)
- Vitest for tests

## Review priorities

When reviewing a PR, focus on these — flag others only if egregious:

1. **Type safety.** No `any` in public API surfaces. Prefer `unknown` + narrowing. `as` casts need justification in surrounding context.
2. **`exactOptionalPropertyTypes` correctness.** Don't assign `undefined` to optional properties — omit the key, or use conditional spread `(x !== undefined ? { x } : {})`.
3. **`verbatimModuleSyntax` correctness.** Type-only imports must use `import type`. Same for re-exports.
4. **Transport contract.** Anything in `packages/sdk/src/transports/` must implement `ScormTransport` exactly. `MemoryTransport`, `LocalStorageTransport`, and `RestTransport` should behave consistently for the player layer — diverging semantics is a bug.
5. **Bundle size.** Targets in scope: sdk < 10 KB gzipped, player < 20 KB, react < 15 KB. Flag heavy dependencies or accidental polyfills.
6. **No leaks across the public API.** Don't re-export internal helpers from `index.ts` unless intentional.
7. **Test coverage.** New transport methods, error paths, and retry logic need tests. Use vitest's `vi.fn<FetchLike>(...)` pattern (see `packages/sdk/src/http/http-client.test.ts`).
8. **Browser/Node compatibility.** SDK code runs in both. Don't reference `window` or `document` in `packages/sdk/` without a guard.

## Don't flag

- Missing comments on self-explanatory code
- Stylistic preferences not in the codebase already
- Renaming for clarity unless the existing name is genuinely misleading
- Suggestions to add docstrings — the codebase intentionally keeps comments minimal

## Conventions worth knowing

- File names: kebab-case (`http-client.ts`, `local-storage.ts`)
- Errors: extend `ScormError`. HTTP errors must include `status` and a stable `code`.
- Async APIs accept an `AbortSignal` via an `options` arg, never as a positional parameter.
- All transports throw `ScormError` (not raw `Error`) for attempt-state violations.

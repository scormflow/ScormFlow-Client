# @scormflow/sdk

> Framework-agnostic TypeScript client for SCORM, xAPI, and cmi5. Pluggable transport — works with the [`scorm-engine`](https://github.com/scormflow/scorm-engine) backend, your own backend, or fully client-side via LocalStorage.

```bash
npm install @scormflow/sdk
```

## Quick start

```ts
import { ScormClient, RestTransport } from '@scormflow/sdk';

const client = new ScormClient({
  transport: new RestTransport({
    baseUrl: 'https://your-engine.example.com',
    apiKey: process.env.SCORMFLOW_KEY!,
  }),
});

await client.runtime.initialize(attemptId);
await client.runtime.commit(attemptId, { 'cmi.score.raw': '85' });
await client.runtime.terminate(attemptId);
```

## Transports

| Transport | Use case | Backend required? |
|-----------|----------|-------------------|
| `RestTransport` | Default. Talks to a `scorm-engine` backend. | Yes |
| `LocalStorageTransport` | Browser-only persistence. Demos, offline learning, previews. | No |
| `MemoryTransport` | Tests and ephemeral previews. | No |

Bring your own by implementing the `ScormTransport` interface.

```ts
import type { ScormTransport } from '@scormflow/sdk';

class MyFirebaseTransport implements ScormTransport {
  async initialize(attemptId: string) { /* ... */ }
  async commit(attemptId: string, values: Record<string, unknown>) { /* ... */ }
  async terminate(attemptId: string, values?: Record<string, unknown>) { /* ... */ }
}
```

## Errors

Typed error hierarchy:

- `ScormError` — base
- `ScormHttpError` — non-2xx response, includes status + body
- `ScormNetworkError` — fetch / connection failure
- `ScormTimeoutError` — request exceeded timeout
- `ScormAbortError` — caller cancelled the request

Retries with exponential backoff are built in for idempotent operations on retryable HTTP status codes.

## Status

`0.0.1` — pre-1.0, API will churn. See the [roadmap](https://github.com/scormflow/scorm-engine-client#roadmap) for what's shipped and what's planned.

## License

MIT

# @scormflow/react

> React hooks and `<ScormPlayer/>` component for ScormFlow. Drop-in SCORM, xAPI, and cmi5 support for any React app.

```bash
npm install @scormflow/react
```

Peer deps: `react >= 18`, `react-dom >= 18`.

## Status

**Pre-release — `0.0.1` is a namespace claim, not a working build.** The implementation is in progress; track [the roadmap](https://github.com/scormflow/scorm-engine-client#roadmap) for shipping milestones.

## Planned usage

```tsx
import {
  ScormProvider,
  ScormPlayer,
  ScormClient,
  RestTransport,
} from '@scormflow/react';

const client = new ScormClient({
  transport: new RestTransport({
    baseUrl: 'https://your-engine.example.com',
    apiKey: process.env.NEXT_PUBLIC_SCORMFLOW_KEY!,
  }),
});

export default function CoursePage({ attemptId }: { attemptId: string }) {
  return (
    <ScormProvider client={client}>
      <ScormPlayer
        attemptId={attemptId}
        className="w-full h-screen"
        onComplete={(r) => console.log('done', r)}
      />
    </ScormProvider>
  );
}
```

### No backend? Use LocalStorage

```tsx
import { ScormProvider, ScormPlayer, ScormClient, LocalStorageTransport } from '@scormflow/react';

const client = new ScormClient({ transport: new LocalStorageTransport() });

<ScormProvider client={client}>
  <ScormPlayer attemptId="local-1" packageUrl="/courses/intro.zip" />
</ScormProvider>
```

## Planned hooks

- `useScorm(attemptId)` — runtime state for an attempt
- `useCourse(courseId)` — course metadata
- `useCourseAnalytics(courseId)` — live analytics
- `useScormUpload()` — upload with progress

## License

MIT

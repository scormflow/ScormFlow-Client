# @scormflow/player

> Iframe-based SCORM player and runtime bridge for the browser. Clean-room implementation of the SCORM 1.2 and 2004 JavaScript APIs.

```bash
npm install @scormflow/player @scormflow/sdk
```

## Status

**Pre-release — `0.0.1` is a namespace claim, not a working build.** The implementation is in progress; track [the roadmap](https://github.com/scormflow/scorm-engine-client#roadmap) for shipping milestones.

## Planned usage

```ts
import { mountScormPlayer } from '@scormflow/player';
import { ScormClient, RestTransport } from '@scormflow/sdk';

const client = new ScormClient({
  transport: new RestTransport({ baseUrl, apiKey }),
});

const player = mountScormPlayer({
  container: '#scorm-root',
  attemptId: 'attempt_abc',
  client,
  onComplete: (result) => console.log(result),
  onProgress: (progress) => console.log(progress),
});
```

The player mounts an iframe, loads the SCO launch URL, and injects `window.API` (SCORM 1.2) and `window.API_1484_11` (SCORM 2004) — wired to whatever `ScormTransport` you configured.

## License

MIT

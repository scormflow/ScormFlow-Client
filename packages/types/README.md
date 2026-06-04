# @scormflow/types

TypeScript types generated from the ScormFlow OpenAPI spec.

```bash
npm install @scormflow/types
```

This package contains type definitions only — no runtime. It is used internally by [`@scormflow/sdk`](https://www.npmjs.com/package/@scormflow/sdk) and is exposed in case you need the raw API types for your own integration.

```ts
import type { components, paths } from '@scormflow/types';

type Course = components['schemas']['Course'];
```

Part of the [ScormFlow Client](https://github.com/scormflow/scorm-engine-client) monorepo. Backend: [`scorm-engine`](https://github.com/scormflow/scorm-engine).

## License

MIT

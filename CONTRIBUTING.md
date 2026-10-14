# Contributing

1. Node.js 22.19+, then `npm ci`.
2. Run it locally: `npm run build && node dist/cli.js`.
3. Before a PR: `npm run lint && npm run typecheck && npm test`. CI runs the same on Linux, macOS and Windows.

All goon features live in `src/goon.ts` (a Pi extension) and the jokes live in `src/copy.ts`. Keep jokes meme-level; nothing explicit.

## Releasing

1. Bump `version` in `package.json` and add a `CHANGELOG.md` entry.
2. Commit, then `git tag vX.Y.Z && git push --follow-tags`.

The Release workflow tests on all 3 OSes, publishes to npm, creates the GitHub release and deploys goon.codes.

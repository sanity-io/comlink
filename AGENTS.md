# AGENTS.md

## Cursor Cloud specific instructions

This is a pnpm + Turborepo monorepo for the `@sanity/comlink` cross-window messaging
libraries. Standard commands are documented in `README.md` and defined in the root
`package.json` scripts; prefer those. Notes below cover non-obvious caveats only.

### Layout

- `packages/comlink` — core library (`@sanity/comlink`).
- `packages/presentation-comlink` — Sanity-internal helpers (`@sanity/presentation-comlink`).
- `apps/playground` — Vite + React demo app that exercises the library end to end.

### Running / testing

- Node 22 and pnpm are already provisioned; dependencies are installed by the startup
  update script (`pnpm install`). No extra system deps, services, secrets, or network
  access are required.
- Root scripts: `pnpm build` (packages only — the root `build` filters out `apps/*`),
  `pnpm type-check`, `pnpm lint` (oxlint, type-aware), `pnpm test` (vitest via turbo).
- `pnpm test` currently reports "No test files found" and passes via
  `--pass-with-no-tests`; that is expected on `main`, not a failure.
- `pnpm lint` emits pre-existing warnings (currently ~20) but 0 errors; a clean lint run
  still has warnings.
- `pnpm dev` runs `turbo run dev`: it watch-builds the packages AND starts the playground
  Vite dev server at http://localhost:5173/ (routes `/` and `/frame/`). It is a
  persistent process — run it in the background (e.g. tmux), not as a blocking command.
- `pnpm-workspace.yaml` sets `allowBuilds.esbuild: false`. Vite/Vitest ship prebuilt
  binaries and still work without esbuild's postinstall; do not flip this to `true`
  unless a dependency actually needs it.

### Playground hello-world

Open http://localhost:5173/, click "Add Frame" (status changes to "1 connected"), type a
message and click Send — it is delivered to the iframe Node, confirming the comlink
handshake and message passing work.

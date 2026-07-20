---
"@sanity/presentation-comlink": minor
---

Add optional `variant` protocol fields for editing variants

Every message that carries a `perspective` now also accepts an optional `variant?: string` (the bare variant id, `undefined` when no variant is selected): `presentation/perspective`, `visual-editing/documents`, the `visual-editing/fetch-perspective` response, `loader/perspective`, `loader/query-change`, `loader/query-listen`, `loader/documents` and `preview-kit/documents`. The `visual-editing/fetch-perspective` request data also accepts an optional `handlesVariantChange?: boolean` capability flag, signaling that `<VisualEditing>` handles variant changes without a full page reload. All new fields are optional, so the protocol stays backward and forward compatible.

---
"@sanity/comlink": patch
"@sanity/presentation-comlink": patch
---

Remove explicit `browserslist` config and `@sanity/browserslist-config` dependency. Builds fall back to the same defaults from `@sanity/pkg-utils` with identical output.

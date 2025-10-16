# Comlink

[![CI](https://github.com/sanity-io/comlink/actions/workflows/ci.yml/badge.svg)](https://github.com/sanity-io/comlink/actions/workflows/ci.yml)

A monorepo containing packages for cross-origin communication between Window contexts, built on the postMessage API.

## Overview

This repository provides TypeScript libraries for establishing and maintaining bidirectional communication between parent and child Window contexts (such as iframes and popups). It's designed to handle one-to-many connections with automatic connection management, heartbeat monitoring, and type-safe message passing.

## Packages

### [@sanity/comlink](./packages/comlink)

The core library for one-to-many cross-origin communication between Window contexts.

**Key Features:**

- 🔄 Automatic connection establishment and recovery
- 💓 Heartbeat monitoring for connection health
- 🎯 Type-safe message passing with TypeScript
- 📡 Request/response pattern support
- 🔌 One-to-many channel management
- 🛡️ Origin validation for security

**Installation:**

```bash
npm install @sanity/comlink
```

**Quick Example:**

```typescript
// Parent window
import {createController} from '@sanity/comlink'

const controller = createController({targetOrigin: 'https://child-origin.com'})
const channel = controller.createChannel({name: 'parent', connectTo: 'child'})

channel.post('greeting', {message: 'Hello!'})

// Child window
import {createNode} from '@sanity/comlink'

const node = createNode({name: 'child', connectTo: 'parent'})
node.on('greeting', (data) => console.log(data.message))
```

[📖 Full Documentation](./packages/comlink/README.md)

### [@sanity/presentation-comlink](./packages/presentation-comlink)

⚠️ **Internal Package** - This package provides specialized message types and compatibility utilities for communication between Sanity's presentation tool and visual editing applications.

This package is used internally by:

- `sanity/presentation`
- `@sanity/visual-editing`
- `@sanity/core-loader`
- `next-sanity/live`
- `@sanity/svelte-loader`
- `@sanity/react-loader`

[📖 Documentation](./packages/presentation-comlink/README.md)

## Development

This is a monorepo managed with [pnpm workspaces](https://pnpm.io/workspaces) and [Turborepo](https://turbo.build/).

### Prerequisites

- Node.js >= 18 (Node.js 22 required for playground app)
- pnpm 10.18.2

### Getting Started

```bash
# Install pnpm if you don't have it
npm install -g pnpm@10.18.2

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Run linter
pnpm lint

# Format code
pnpm format

# Type check
pnpm type-check
```

### Development Workflow

```bash
# Watch mode for development (also runs the playground app)
pnpm dev
```

The playground app is also deployed to Vercel and available at [https://comlink-playground.sanity.dev/](https://comlink-playground.sanity.dev/)

### Project Structure

```
.
├── apps/
│   └── playground/          # Example application for testing
├── packages/
│   ├── comlink/            # Core communication library
│   └── presentation-comlink/ # Sanity-specific utilities
└── .changeset/             # Changeset configuration for releases
```

## Publishing

This repository uses [Changesets](https://github.com/changesets/changesets) for version management and publishing.

To release a new version:

1. Create a changeset describing your changes:
   ```bash
   pnpm changeset add
   ```
2. Open a PR with your changes and the changeset
3. Once merged, a "Version Packages" PR will be automatically created
4. Merge the "Version Packages" PR to publish the new version

## Architecture

### Controllers & Channels

Controllers manage one or more Channels that communicate with Nodes in child windows. Each Channel can connect to multiple Nodes across different Window contexts.

```
┌─────────────────────────────────┐
│     Parent Window               │
│                                 │
│  ┌──────────┐                  │
│  │Controller│                  │
│  └────┬─────┘                  │
│       │                        │
│  ┌────▼──────┐  ┌──────────┐  │
│  │ Channel 1 │  │Channel 2 │  │
│  └─────┬─────┘  └────┬─────┘  │
└────────┼─────────────┼─────────┘
         │             │
    ┌────▼────┐   ┌───▼────┐
    │ iframe  │   │ popup  │
    │  Node   │   │  Node  │
    └─────────┘   └────────┘
```

### Connection States

Connections progress through the following states:

- `idle` → `handshaking` → `connected` → `disconnected`

## Contributing

Contributions are welcome! Please read the code and follow existing patterns when contributing.

### Code Quality

- All code must pass TypeScript type checking
- Follow existing code style (enforced by Prettier)
- Ensure linter passes (oxlint with type-aware checks)
- Add tests for new functionality

## License

MIT License © 2016-2025 Sanity.io

See [LICENSE](./LICENSE) for more details.

## Resources

- [Sanity.io](https://www.sanity.io)
- [Sanity Documentation](https://www.sanity.io/docs)

## Related Projects

- [@sanity/visual-editing](https://github.com/sanity-io/visual-editing) - Visual editing tools for Sanity
- [sanity](https://github.com/sanity-io/sanity) - The Sanity Studio and toolkit

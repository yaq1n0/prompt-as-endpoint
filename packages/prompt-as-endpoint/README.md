# prompt-as-endpoint

A simple TypeScript function for demonstration purposes.

## Installation

```bash
npm install prompt-as-endpoint
```

## Usage

```typescript
import { helloWorld } from 'prompt-as-endpoint';

helloWorld(); // Logs: "hello world"
```

### CommonJS

```javascript
const { helloWorld } = require('prompt-as-endpoint');

helloWorld(); // Logs: "hello world"
```

## API

### `helloWorld()`

A simple function that logs "hello world" to the console.

**Returns:** `void`

## Development

### Prerequisites

- Node.js >= 22.0.0
- npm >= 8.0.0

### Scripts

```bash
# Build the package
npm run build

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check

# Type check
npm run typecheck

# Clean build artifacts
npm run clean
```

### Building

The package is built using [tsup](https://tsup.egoist.dev/) and outputs:

- `dist/index.js` - CommonJS format
- `dist/index.mjs` - ES Module format
- `dist/index.d.ts` - TypeScript declarations

### Testing

Tests are written using [Vitest](https://vitest.dev/) and can be found in `src/*.test.ts` files.

## License

MIT

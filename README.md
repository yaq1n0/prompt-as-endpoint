# Prompt as Endpoint Monorepo

A TypeScript monorepo containing packages for modern npm development.

## Packages

- [`prompt-as-endpoint`](./packages/prompt-as-endpoint) - A simple TypeScript function demonstration package
- [`prompt-as-endpoint-demo`](./packages/prompt-as-endpoint-demo) - Demo web server showcasing the main package using Hono

## Getting Started

### Prerequisites

- Node.js >= 22.0.0
- npm >= 8.0.0

### Installation

```bash
npm install
```

### Development

```bash
# Build all packages
npm run build

# Run tests for all packages
npm run test

# Lint all packages
npm run lint

# Format all packages
npm run format

# Clean build artifacts
npm run clean
```

## Package Development

Each package in the `packages/` directory is a standalone npm package with its own:

- `package.json` with scripts and dependencies
- TypeScript configuration
- Testing setup with Vitest
- Build configuration with tsup

## 🚀 Try the Demo

To see the `prompt-as-endpoint` package in action:

```bash
# Build all packages
npm run build

# Navigate to demo package
cd packages/prompt-as-endpoint-demo

# Start the demo server
npm start

# Test the endpoints
curl http://localhost:3000/
curl http://localhost:3000/hello
```

The demo server provides HTTP endpoints that call functions from the main package, showcasing how to integrate it into web applications.

## CI/CD

This repository includes GitHub Actions workflows for:

- ✅ Linting and formatting checks
- ✅ Type checking
- ✅ Building and verification

## Tech Stack

- **TypeScript** - Type-safe JavaScript
- **tsup** - Fast TypeScript bundler
- **Vitest** - Fast unit testing framework
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **GitHub Actions** - CI/CD automation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT

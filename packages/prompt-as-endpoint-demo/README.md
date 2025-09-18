# prompt-as-endpoint-demo

A demo web server built with [Hono](https://hono.dev/) that showcases the `prompt-as-endpoint` npm package in action.

## What is this?

This is a simple demonstration application that shows how to use the `prompt-as-endpoint` package in a real-world web server. It provides HTTP endpoints that call the functions from the main package and return the results as JSON.

## 🚀 Quick Start

### Prerequisites

- Node.js >= 22.0.0
- npm >= 8.0.0

### Installation

From the monorepo root:

```bash
# Install all dependencies
npm install

# Build the prompt-as-endpoint package first
npm run build

# Navigate to the demo package
cd packages/prompt-as-endpoint-demo

# Start the development server
npm run dev
```

### Running the Server

```bash
# Development mode (with hot reload)
npm run dev

# Production build and start
npm run build
npm start
```

The server will start on `http://localhost:3000` by default.

## 📋 Available Endpoints

### `GET /`

Returns information about the demo server and available endpoints.

**Response:**

```json
{
  "message": "prompt-as-endpoint Demo Server",
  "description": "A demo application showcasing the prompt-as-endpoint npm package",
  "endpoints": {
    "/": "This info endpoint",
    "/hello": "Calls the helloWorld function from prompt-as-endpoint package",
    "/health": "Health check endpoint"
  },
  "package": "prompt-as-endpoint",
  "version": "1.0.0"
}
```

### `GET /hello`

Calls the `helloWorld()` function from the `prompt-as-endpoint` package and returns the output.

**Response:**

```json
{
  "message": "Successfully called helloWorld() from prompt-as-endpoint package",
  "output": "hello world",
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

### `GET /health`

Health check endpoint for monitoring.

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2025-01-01T12:00:00.000Z",
  "uptime": 123.456
}
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🛠️ Development

```bash
# Build the application
npm run build

# Build in watch mode
npm run build:watch

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

## 🌐 Environment Variables

- `PORT` - Server port (default: 3000)

## 📦 Dependencies

- **[Hono](https://hono.dev/)** - Fast, lightweight web framework
- **[@hono/node-server](https://github.com/honojs/node-server)** - Node.js adapter for Hono
- **prompt-as-endpoint** - The main package being demonstrated

## 🏗️ Tech Stack

- **TypeScript** - Type-safe JavaScript
- **Hono** - Web framework
- **tsup** - Fast TypeScript bundler
- **Vitest** - Testing framework
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 📄 Example Usage

```bash
# Start the server
npm run dev

# Test the endpoints
curl http://localhost:3000/
curl http://localhost:3000/hello
curl http://localhost:3000/health
```

## 🤝 Contributing

This is a demonstration package. For the main package contributions, see the root README.

## 📝 License

MIT

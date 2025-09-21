# prompt-as-endpoint

Helper library for creating HTTP endpoints that use LLMs to return schema-validated JSON responses.

## Quick Start

```bash
npm install
npm run build
npm run demo:dev
```

Visit `http://localhost:3000` and try:

```bash
curl -X POST http://localhost:3000/greet \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe"}'
```

## Packages

- [`prompt-as-endpoint`](./packages/prompt-as-endpoint) - Main library
- [`prompt-as-endpoint-demo`](./packages/prompt-as-endpoint-demo) - Demo server

## License

MIT

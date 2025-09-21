# prompt-as-endpoint-demo

Demo server showcasing the `prompt-as-endpoint` library with Hono.

## Quick Start

```bash
npm run dev
```

Visit `http://localhost:3000` for available endpoints.

## Test the Demo

```bash
curl -X POST http://localhost:3000/greet \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe"}'
```

## License

MIT

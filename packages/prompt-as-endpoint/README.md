# prompt-as-endpoint

Helper library for creating HTTP endpoints that use LLMs to return schema-validated JSON responses.

## Installation

```bash
npm install prompt-as-endpoint
```

## Usage

```typescript
import { createEndpointHandler } from 'prompt-as-endpoint';
import { z } from 'zod';

// Define your response schema
const schema = z.object({
  greeting: z.string(),
  mood: z.string(),
});

// Wrap your llm call
const call = async prompt => {
  // Call your LLM here
  const response = await llm.call(prompt);
  return response; // Should return JSON string
};

// Create handler
const handler = createEndpointHandler(
  schema,
  'Greet {name} in a {style} way',
  call
);

// Adapt your web framework to the the handler (framework dependent)
const wrapHandler = (..., handler) => {... handler() ... }

// Use in your endpoint
app.mapGet('/greet', wrapHandler(..., handler);

// Returns validated { greeting: string, mood: string }
```

## License

MIT

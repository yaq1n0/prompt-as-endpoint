import { serve } from '@hono/node-server';
import { Context, Hono } from 'hono';
import {
  createEndpointHandler,
  isValidInput,
  type LLMCall,
} from 'prompt-as-endpoint';
import z from 'zod';

const app = new Hono();

const mockLLMCall: LLMCall = async (prompt: string): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 100));

  // Simple mock logic based on the prompt content
  if (prompt.includes('Greet')) {
    const nameMatch = prompt.match(/Greet (.+)/);
    const name = nameMatch ? nameMatch[1] : 'Unknown';

    return JSON.stringify({
      peopleGreeted: 1,
      greetingTitle: `Hello ${name}`,
      greetingNotes: 'What a wonderful day to meet new people!',
    });
  }

  // Default response
  return JSON.stringify({
    peopleGreeted: 0,
    greetingTitle: 'Hello there!',
  });
};

// Create the greeting endpoint handler
const greetPrompt = 'Greet {firstName} {lastName}';
const greetResponseSchema = z.object({
  peopleGreeted: z.number(),
  greetingTitle: z.string(),
  greetingNotes: z.string().optional(),
});
const handleGreet = createEndpointHandler(
  greetResponseSchema,
  greetPrompt,
  mockLLMCall
);

// Root endpoint with basic info
app.get('/', c => {
  return c.json({
    message: 'prompt-as-endpoint Hono Demo Server',
    description:
      'A demo application showcasing the prompt-as-endpoint npm package',
    endpoints: {
      '/': 'This info endpoint',
      '/greet': 'POST - Greet a person using LLM with JSON validation',
      '/health': 'Health check endpoint',
    },
    package: 'prompt-as-endpoint',
    version: '1.0.0',
    usage: {
      '/greet': {
        method: 'POST',
        body: {
          firstName: 'John',
          lastName: 'Doe',
        },
        example:
          'curl -X POST http://localhost:3000/greet -H "Content-Type: application/json" -d \'{"firstName":"John","lastName":"Doe"}\'',
      },
    },
  });
});

export const wrapHonoEndpoint = async <T>(
  handler: (body: Record<string, string>) => Promise<T>,
  c: Context
) => {
  try {
    const body = await c.req.json();
    if (!isValidInput(body)) return c.status(400);
    const result = await handler(body);
    return c.json(result);
  } catch {
    return c.status(500);
  }
};

// Greeting endpoint that demonstrates the prompt-as-endpoint functionality
app.post('/greet', c => wrapHonoEndpoint(handleGreet, c));

// Health check endpoint
app.get('/health', c => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 404 handler
app.notFound(c => {
  return c.json(
    {
      error: 'Not Found',
      message: 'The requested endpoint does not exist',
      availableEndpoints: ['/', '/greet', '/health'],
    },
    404
  );
});

// Error handler
app.onError((err, c) => {
  console.error(`Error: ${err.message}`);
  return c.json(
    {
      error: 'Internal Server Error',
      message: err.message,
      timestamp: new Date().toISOString(),
    },
    500
  );
});

const port = Number(process.env.PORT) || 3000;

console.log(`Server starting on port ${port}`);

// Start the server if this file is run directly
if (require.main === module) {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    console.log('Development mode - Hot restart enabled');
    console.log(`Server will restart on file changes`);
  }

  console.log(`Starting server on port ${port}`);

  serve({
    fetch: app.fetch,
    port,
  });

  console.log(`Hono server is running on http://localhost:${port}`);

  if (isDev) {
    console.log(`\nAvailable endpoints:`);
    console.log(`   GET  /        - Server info`);
    console.log(`   POST /greet   - Demo the prompt-as-endpoint package`);
    console.log(`   GET  /health  - Health check`);
    console.log(
      `\nTry: curl -X POST http://localhost:${port}/greet -H "Content-Type: application/json" -d '{"firstName":"John","lastName":"Doe"}'\n`
    );
  }
}

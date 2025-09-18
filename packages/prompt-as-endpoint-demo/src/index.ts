import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { helloWorld } from 'prompt-as-endpoint';

const app = new Hono();

// Add request logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use('*', logger());
}

// Root endpoint with basic info
app.get('/', c => {
  return c.json({
    message: 'prompt-as-endpoint Demo Server',
    description:
      'A demo application showcasing the prompt-as-endpoint npm package',
    endpoints: {
      '/': 'This info endpoint',
      '/hello': 'Calls the helloWorld function from prompt-as-endpoint package',
      '/health': 'Health check endpoint',
    },
    package: 'prompt-as-endpoint',
    version: '1.0.0',
  });
});

// Demo endpoint that uses the prompt-as-endpoint package
app.get('/hello', c => {
  try {
    // Capture console.log output to return in response
    const originalLog = console.log;
    let capturedOutput = '';

    console.log = (message: string) => {
      capturedOutput = message;
      originalLog(message); // Still log to console
    };

    // Call the helloWorld function from the package
    helloWorld();

    // Restore original console.log
    console.log = originalLog;

    return c.json({
      message:
        'Successfully called helloWorld() from prompt-as-endpoint package',
      output: capturedOutput,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return c.json(
      {
        error: 'Failed to call helloWorld function',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      500
    );
  }
});

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
      availableEndpoints: ['/', '/hello', '/health'],
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

console.log(`🚀 Server starting on port ${port}`);
console.log(`📖 Open http://localhost:${port} to see the demo`);

export default {
  port,
  fetch: app.fetch,
};

// Start the server if this file is run directly
if (require.main === module) {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    console.log('🔥 Development mode - Hot restart enabled');
    console.log(`📡 Server will restart on file changes`);
  }

  console.log(`🚀 Starting server on port ${port}`);

  serve({
    fetch: app.fetch,
    port,
  });

  console.log(`🌟 Hono server is running on http://localhost:${port}`);

  if (isDev) {
    console.log(`\n📋 Available endpoints:`);
    console.log(`   GET  /        - Server info`);
    console.log(`   GET  /hello   - Demo the prompt-as-endpoint package`);
    console.log(`   GET  /health  - Health check`);
    console.log(`\n💡 Try: curl http://localhost:${port}/hello\n`);
  }
}

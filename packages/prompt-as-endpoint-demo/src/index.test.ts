import { describe, expect, it } from 'vitest';

// Import the Hono app (not the server startup part)
const createApp = async () => {
  // Dynamically import to avoid server startup
  const { Hono } = await import('hono');
  const { helloWorld } = await import('prompt-as-endpoint');

  const app = new Hono();

  app.get('/', c => {
    return c.json({
      message: 'prompt-as-endpoint Demo Server',
      description:
        'A demo application showcasing the prompt-as-endpoint npm package',
      endpoints: {
        '/': 'This info endpoint',
        '/hello':
          'Calls the helloWorld function from prompt-as-endpoint package',
        '/health': 'Health check endpoint',
      },
      package: 'prompt-as-endpoint',
      version: '1.0.0',
    });
  });

  app.get('/hello', c => {
    try {
      const originalLog = console.log;
      let capturedOutput = '';

      console.log = (message: string) => {
        capturedOutput = message;
        originalLog(message);
      };

      helloWorld();
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

  return app;
};

describe('Demo Server API', () => {
  it('should return server info on root endpoint', async () => {
    const app = await createApp();

    const res = await app.request('http://localhost/');
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe('prompt-as-endpoint Demo Server');
    expect(data.package).toBe('prompt-as-endpoint');
    expect(data.endpoints).toHaveProperty('/hello');
  });

  it('should call helloWorld function and return output', async () => {
    const app = await createApp();

    const res = await app.request('http://localhost/hello');
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe(
      'Successfully called helloWorld() from prompt-as-endpoint package'
    );
    expect(data.output).toBe('hello world');
    expect(data.timestamp).toBeDefined();
  });

  it('should return health status', async () => {
    const app = await createApp();

    const res = await app.request('http://localhost/health');
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.status).toBe('healthy');
    expect(data.timestamp).toBeDefined();
    expect(typeof data.uptime).toBe('number');
  });

  it('should return 404 for unknown endpoints', async () => {
    const app = await createApp();

    const res = await app.request('http://localhost/unknown');
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toBe('Not Found');
    expect(data.availableEndpoints).toContain('/hello');
  });
});

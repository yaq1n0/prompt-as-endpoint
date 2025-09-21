import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockedFunction,
} from 'vitest';
import { z } from 'zod';
import {
  createEndpointHandler,
  isValidInput,
  type LLMCall,
} from './createEndpointHandler';

describe('isValidInput', () => {
  it('should return true for a record of string keys and string values', () => {
    expect(isValidInput({ firstName: 'John', lastName: 'Doe' })).toBe(true);
  });

  it('should return false for a record of string keys and non-string values', () => {
    expect(isValidInput({ firstName: 'John', lastName: 19876 })).toBe(false);
  });
});

describe('createEndpointHandler', () => {
  const greetResponseSchema = z.object({
    peopleGreeted: z.number(),
    greetingTitle: z.string(),
    greetingNotes: z.string().optional(),
  });

  const mockLLMCall: MockedFunction<LLMCall> = vi.fn();

  beforeEach(vi.resetAllMocks);

  it('should create a handler that formats prompt and validates response', async () => {
    const prompt = 'Greet {firstName} {lastName}';
    const mockResponse = JSON.stringify({
      peopleGreeted: 1,
      greetingTitle: 'Hello John Doe',
      greetingNotes: "Nice weather we're having",
    });

    mockLLMCall.mockResolvedValue(mockResponse);

    const handler = createEndpointHandler(
      greetResponseSchema,
      prompt,
      mockLLMCall
    );
    const result = await handler({ firstName: 'John', lastName: 'Doe' });

    expect(mockLLMCall).toHaveBeenCalledWith('Greet John Doe');
    expect(result).toEqual({
      peopleGreeted: 1,
      greetingTitle: 'Hello John Doe',
      greetingNotes: "Nice weather we're having",
    });
  });

  it('should handle optional fields in response', async () => {
    const prompt = 'Greet {firstName}';
    const mockResponse = JSON.stringify({
      peopleGreeted: 1,
      greetingTitle: 'Hello John',
    });

    mockLLMCall.mockResolvedValue(mockResponse);

    const handler = createEndpointHandler(
      greetResponseSchema,
      prompt,
      mockLLMCall
    );
    const result = await handler({ firstName: 'John' });

    expect(result).toEqual({
      peopleGreeted: 1,
      greetingTitle: 'Hello John',
    });
  });

  it('should preserve unmatched placeholders in prompt', async () => {
    const prompt = 'Greet {firstName} {lastName} from {city}';
    const mockResponse = JSON.stringify({
      peopleGreeted: 1,
      greetingTitle: 'Hello John Doe',
    });

    mockLLMCall.mockResolvedValue(mockResponse);

    const handler = createEndpointHandler(
      greetResponseSchema,
      prompt,
      mockLLMCall
    );
    await handler({ firstName: 'John', lastName: 'Doe' });

    expect(mockLLMCall).toHaveBeenCalledWith('Greet John Doe from {city}');
  });

  it('should throw error when LLM response is not valid JSON', async () => {
    const prompt = 'Greet {firstName}';
    const mockResponse = 'This is not JSON';

    mockLLMCall.mockResolvedValue(mockResponse);

    const handler = createEndpointHandler(
      greetResponseSchema,
      prompt,
      mockLLMCall
    );

    await expect(handler({ firstName: 'John' })).rejects.toThrow(
      'LLM response is not valid JSON: This is not JSON'
    );
  });

  it('should throw error when LLM response does not match schema', async () => {
    const prompt = 'Greet {firstName}';
    const mockResponse = JSON.stringify({
      wrongField: 'value',
    });

    mockLLMCall.mockResolvedValue(mockResponse);

    const handler = createEndpointHandler(
      greetResponseSchema,
      prompt,
      mockLLMCall
    );

    await expect(handler({ firstName: 'John' })).rejects.toThrow(
      /LLM response does not match expected schema/
    );
  });

  it('should throw error when required fields are missing', async () => {
    const prompt = 'Greet {firstName}';
    const mockResponse = JSON.stringify({
      peopleGreeted: 1,
      // missing greetingTitle
    });

    mockLLMCall.mockResolvedValue(mockResponse);

    const handler = createEndpointHandler(
      greetResponseSchema,
      prompt,
      mockLLMCall
    );

    await expect(handler({ firstName: 'John' })).rejects.toThrow(
      /LLM response does not match expected schema/
    );
  });

  it('should work with different schema types', async () => {
    const numberSchema = z.object({
      result: z.number(),
      message: z.string(),
    });

    const prompt = 'Calculate {operation}';
    const mockResponse = JSON.stringify({
      result: 42,
      message: 'The answer is 42',
    });

    mockLLMCall.mockResolvedValue(mockResponse);

    const handler = createEndpointHandler(numberSchema, prompt, mockLLMCall);
    const result = await handler({ operation: '2 + 2' });

    expect(result).toEqual({
      result: 42,
      message: 'The answer is 42',
    });
  });

  it('should handle empty input object', async () => {
    const prompt = 'Say hello';
    const mockResponse = JSON.stringify({
      peopleGreeted: 0,
      greetingTitle: 'Hello world',
    });

    mockLLMCall.mockResolvedValue(mockResponse);

    const handler = createEndpointHandler(
      greetResponseSchema,
      prompt,
      mockLLMCall
    );
    const result = await handler({});

    expect(mockLLMCall).toHaveBeenCalledWith('Say hello');
    expect(result.greetingTitle).toBe('Hello world');
  });
});

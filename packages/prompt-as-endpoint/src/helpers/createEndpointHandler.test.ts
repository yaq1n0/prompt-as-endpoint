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
import { getNamedKeys } from './stringHelpers';

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

  describe('requiredKeys validation', () => {
    it('should validate that required keys are present in input', async () => {
      const prompt = 'Greet {firstName} {lastName}';
      const mockResponse = JSON.stringify({
        peopleGreeted: 1,
        greetingTitle: 'Hello John Doe',
      });

      mockLLMCall.mockResolvedValue(mockResponse);

      const handler = createEndpointHandler(
        greetResponseSchema,
        prompt,
        mockLLMCall,
        {
          requiredKeys: ['firstName', 'lastName'],
        }
      );

      const result = await handler({ firstName: 'John', lastName: 'Doe' });
      expect(result.greetingTitle).toBe('Hello John Doe');
    });

    it('should throw error when required keys are missing from input', async () => {
      const prompt = 'Greet {firstName} {lastName}';

      const handler = createEndpointHandler(
        greetResponseSchema,
        prompt,
        mockLLMCall,
        {
          requiredKeys: ['firstName', 'lastName'],
        }
      );

      await expect(
        handler({ firstName: 'John' }) // missing lastName
      ).rejects.toThrow('Missing required keys in input: lastName');
    });

    it('should throw error when multiple required keys are missing', async () => {
      const prompt = 'Greet {firstName} {lastName} from {city}';

      const handler = createEndpointHandler(
        greetResponseSchema,
        prompt,
        mockLLMCall,
        {
          requiredKeys: ['firstName', 'lastName', 'city'],
        }
      );

      await expect(
        handler({ firstName: 'John' }) // missing lastName and city
      ).rejects.toThrow('Missing required keys in input: lastName, city');
    });

    it('should work when no required keys are specified', async () => {
      const prompt = 'Say hello to {name}';
      const mockResponse = JSON.stringify({
        peopleGreeted: 0,
        greetingTitle: 'Hello world',
      });

      mockLLMCall.mockResolvedValue(mockResponse);

      const handler = createEndpointHandler(
        greetResponseSchema,
        prompt,
        mockLLMCall,
        {} // no requiredKeys specified
      );

      const result = await handler({});
      expect(result.greetingTitle).toBe('Hello world');
    });

    it('should work when required keys array is empty', async () => {
      const prompt = 'Say hello to {name}';
      const mockResponse = JSON.stringify({
        peopleGreeted: 0,
        greetingTitle: 'Hello world',
      });

      mockLLMCall.mockResolvedValue(mockResponse);

      const handler = createEndpointHandler(
        greetResponseSchema,
        prompt,
        mockLLMCall,
        {
          requiredKeys: [], // empty array
        }
      );

      const result = await handler({});
      expect(result.greetingTitle).toBe('Hello world');
    });

    it('should throw error for empty string values in required keys', async () => {
      const prompt = 'Process {flag} and {count}';

      const handler = createEndpointHandler(
        greetResponseSchema,
        prompt,
        mockLLMCall,
        {
          requiredKeys: ['flag', 'count'],
        }
      );

      // Empty strings are treated as missing values (falsy check)
      await expect(
        handler({ flag: '', count: '0' }) // empty string for flag
      ).rejects.toThrow('Missing required keys in input: flag');
    });

    it('should accept valid non-empty string values for required keys', async () => {
      const prompt = 'Process {flag} and {count}';
      const mockResponse = JSON.stringify({
        peopleGreeted: 0,
        greetingTitle: 'Processed',
      });

      mockLLMCall.mockResolvedValue(mockResponse);

      const handler = createEndpointHandler(
        greetResponseSchema,
        prompt,
        mockLLMCall,
        {
          requiredKeys: ['flag', 'count'],
        }
      );

      const result = await handler({ flag: 'true', count: '0' });
      expect(mockLLMCall).toHaveBeenCalledWith('Process true and 0');
      expect(result.greetingTitle).toBe('Processed');
    });
  });

  describe('integration with getNamedKeys', () => {
    it('should automatically extract and validate required keys from prompt', async () => {
      const prompt = 'Greet {firstName} {lastName} from {city}';
      const requiredKeys = getNamedKeys(prompt);
      const mockResponse = JSON.stringify({
        peopleGreeted: 1,
        greetingTitle: 'Hello John Doe from NYC',
      });

      mockLLMCall.mockResolvedValue(mockResponse);

      const handler = createEndpointHandler(
        greetResponseSchema,
        prompt,
        mockLLMCall,
        {
          requiredKeys,
        }
      );

      const result = await handler({
        firstName: 'John',
        lastName: 'Doe',
        city: 'NYC',
      });

      expect(mockLLMCall).toHaveBeenCalledWith('Greet John Doe from NYC');
      expect(result.greetingTitle).toBe('Hello John Doe from NYC');
    });

    it('should throw error when input missing keys extracted by getNamedKeys', async () => {
      const prompt = 'Welcome {userName} to {platform}';
      const requiredKeys = getNamedKeys(prompt);

      const handler = createEndpointHandler(
        greetResponseSchema,
        prompt,
        mockLLMCall,
        {
          requiredKeys,
        }
      );

      await expect(
        handler({ userName: 'alice' }) // missing platform
      ).rejects.toThrow('Missing required keys in input: platform');
    });

    it('should work with prompts containing duplicate placeholders', async () => {
      const prompt = 'Hello {name}, nice to meet you {name}!';
      const requiredKeys = getNamedKeys(prompt);
      const mockResponse = JSON.stringify({
        peopleGreeted: 1,
        greetingTitle: 'Hello Alice, nice to meet you Alice!',
      });

      mockLLMCall.mockResolvedValue(mockResponse);

      const handler = createEndpointHandler(
        greetResponseSchema,
        prompt,
        mockLLMCall,
        {
          requiredKeys,
        }
      );

      const result = await handler({ name: 'Alice' });

      expect(mockLLMCall).toHaveBeenCalledWith(
        'Hello Alice, nice to meet you Alice!'
      );
      expect(result.greetingTitle).toBe('Hello Alice, nice to meet you Alice!');
    });

    it('should handle prompts with no placeholders', async () => {
      const prompt = 'Say hello to everyone';
      const requiredKeys = getNamedKeys(prompt);
      const mockResponse = JSON.stringify({
        peopleGreeted: 0,
        greetingTitle: 'Hello everyone!',
      });

      mockLLMCall.mockResolvedValue(mockResponse);

      const handler = createEndpointHandler(
        greetResponseSchema,
        prompt,
        mockLLMCall,
        {
          requiredKeys, // should be empty array
        }
      );

      const result = await handler({});

      expect(requiredKeys).toEqual([]);
      expect(mockLLMCall).toHaveBeenCalledWith('Say hello to everyone');
      expect(result.greetingTitle).toBe('Hello everyone!');
    });

    it('should work with complex prompts containing mixed placeholders', async () => {
      const prompt =
        'User {userId} with email {userEmail} wants to {action} item {itemId}';
      const requiredKeys = getNamedKeys(prompt);
      const mockResponse = JSON.stringify({
        peopleGreeted: 1,
        greetingTitle:
          'User 123 with email user@example.com wants to purchase item 456',
      });

      mockLLMCall.mockResolvedValue(mockResponse);

      const handler = createEndpointHandler(
        greetResponseSchema,
        prompt,
        mockLLMCall,
        {
          requiredKeys,
        }
      );

      const result = await handler({
        userId: '123',
        userEmail: 'user@example.com',
        action: 'purchase',
        itemId: '456',
      });

      expect(requiredKeys).toEqual(['userId', 'userEmail', 'action', 'itemId']);
      expect(mockLLMCall).toHaveBeenCalledWith(
        'User 123 with email user@example.com wants to purchase item 456'
      );
      expect(result.greetingTitle).toBe(
        'User 123 with email user@example.com wants to purchase item 456'
      );
    });
  });
});

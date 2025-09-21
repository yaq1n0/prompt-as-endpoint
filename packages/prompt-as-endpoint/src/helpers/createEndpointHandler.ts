import { z } from 'zod';
import { namedLenientFormat } from './stringHelpers';

/** A function that calls an LLM and returns the response */
export type LLMCall = (prompt: string) => Promise<string>;

/** Little function to assert that the typically unknown input is a Record<string, string>
 * that can be used to populate a prompt that's used by createEndpointHandler */
export const isValidInput = (x: unknown): x is Record<string, string> =>
  x != null &&
  typeof x === 'object' &&
  Object.values(x).every(v => typeof v === 'string');

/** This function creates a function that can be used as a handler for a server endpoint
 *
 * The server endpoint handler generated follows the following type:
 * (input: z.infer<typeof inputType>) => z.infer<typeof outputType>
 * which practically means that the input and output of the function are validated against the inputType and outputType schemas
 *
 * the input type's properties are best-fit populated into the prompt using namedLenientFormat
 */
export const createEndpointHandler = <T extends z.ZodSchema>(
  outputType: T,
  prompt: string,
  call: LLMCall
): ((input: Record<string, string>) => Promise<z.infer<T>>) => {
  return async (input: Record<string, string>) => {
    const populatedPrompt = namedLenientFormat(prompt, input);
    const response = await call(populatedPrompt);

    // Parse the LLM response as JSON first
    let jsonResponse: unknown;
    try {
      jsonResponse = JSON.parse(response);
    } catch (error) {
      throw new Error(`LLM response is not valid JSON: ${response}`);
    }

    // Validate against the schema
    const result = await outputType.safeParseAsync(jsonResponse);
    if (!result.success) {
      throw new Error(
        `LLM response does not match expected schema: ${result.error.message}`
      );
    }

    return result.data;
  };
};

/** Takes in a string and replaces {0}, {1}, {2}, etc. with the corresponding argument
 * e.g. lenientFormat('Hello {0}', ['John']) => 'Hello John'
 */
export const lenientFormat = (input: string, params: string[]): string =>
  input.replace(/{(\d+)}/g, (match, index) => params[index] || match);

/** Takes in a string and a record<string, string> and replaces the keys with the corresponding values
 * e.g. namedLenientFormat('Hello {name}', { name: 'John' }) => 'Hello John'
 */
export const namedLenientFormat = (
  input: string,
  params: Record<string, string>
): string => input.replace(/{(\w+)}/g, (match, key) => params[key] || match);

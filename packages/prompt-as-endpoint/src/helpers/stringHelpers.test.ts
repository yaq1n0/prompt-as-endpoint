import { describe, expect, it } from 'vitest';
import {
  getNamedKeys,
  lenientFormat,
  namedLenientFormat,
} from './stringHelpers';

describe('lenientFormat', () => {
  it.each<{
    input: string;
    params: string[];
    expected: string;
    description: string;
  }>([
    // Basic functionality
    {
      input: 'Hello {0}',
      params: ['John'],
      expected: 'Hello John',
      description: 'single placeholder',
    },
    {
      input: 'Hello {0}, you are {1} years old',
      params: ['John', '25'],
      expected: 'Hello John, you are 25 years old',
      description: 'multiple placeholders',
    },
    {
      input: '{1} is {0} years old',
      params: ['25', 'John'],
      expected: 'John is 25 years old',
      description: 'placeholders in any order',
    },
    // Edge cases with missing parameters
    {
      input: 'Hello {0}, you are {1} years old',
      params: ['John'],
      expected: 'Hello John, you are {1} years old',
      description: 'missing parameter (leaves placeholder)',
    },
    {
      input: '{0} {1} {2} {3}',
      params: ['A', 'B'],
      expected: 'A B {2} {3}',
      description: 'mixed existing and missing parameters',
    },
    // Empty cases
    {
      input: 'Hello {0}',
      params: [],
      expected: 'Hello {0}',
      description: 'empty parameter array',
    },
    {
      input: '',
      params: ['John'],
      expected: '',
      description: 'empty string input',
    },
    {
      input: 'Hello world',
      params: ['John'],
      expected: 'Hello world',
      description: 'input with no placeholders',
    },
    // Special cases
    {
      input: '{0} and {0} are friends',
      params: ['Alice'],
      expected: 'Alice and Alice are friends',
      description: 'duplicate placeholders',
    },
  ])('should handle $description', ({ input, params, expected }) => {
    expect(lenientFormat(input, params)).toBe(expected);
  });

  it('should handle higher index placeholders', () => {
    expect(
      lenientFormat('Item {10} is {5}', [
        'a',
        'b',
        'c',
        'd',
        'e',
        'available',
        'g',
        'h',
        'i',
        'j',
        'special',
      ])
    ).toBe('Item special is available');
  });

  it('should handle malformed placeholders gracefully', () => {
    expect(lenientFormat('Hello {0} {1 world', ['John', 'beautiful'])).toBe(
      'Hello John {1 world'
    );
    expect(lenientFormat('Hello {0} {abc} world', ['John'])).toBe(
      'Hello John {abc} world'
    );
  });
});

describe('namedLenientFormat', () => {
  it.each<{
    input: string;
    params: Record<string, string>;
    expected: string;
    description: string;
  }>([
    // Basic functionality
    {
      input: 'Hello {name}',
      params: { name: 'John' },
      expected: 'Hello John',
      description: 'single named placeholder',
    },
    {
      input: 'Hello {name}, you are {age} years old',
      params: { name: 'John', age: '25' },
      expected: 'Hello John, you are 25 years old',
      description: 'multiple named placeholders',
    },
    // Edge cases with missing keys
    {
      input: 'Hello {name}, you are {age} years old',
      params: { name: 'John' },
      expected: 'Hello John, you are {age} years old',
      description: 'missing key (leaves placeholder)',
    },
    {
      input: '{first} {middle} {last}',
      params: { first: 'John', last: 'Doe' },
      expected: 'John {middle} Doe',
      description: 'mixed existing and missing keys',
    },
    // Empty cases
    {
      input: 'Hello {name}',
      params: {},
      expected: 'Hello {name}',
      description: 'empty params object',
    },
    {
      input: '',
      params: { name: 'John' },
      expected: '',
      description: 'empty string input',
    },
    {
      input: 'Hello world',
      params: { name: 'John' },
      expected: 'Hello world',
      description: 'input with no placeholders',
    },
    // Special cases
    {
      input: '{name} and {name} are friends',
      params: { name: 'Alice' },
      expected: 'Alice and Alice are friends',
      description: 'duplicate placeholders',
    },
    {
      input: 'User {user_id} has {total_2} items',
      params: { user_id: '123', total_2: '5' },
      expected: 'User 123 has 5 items',
      description: 'keys with underscores and numbers',
    },
    {
      input: '{Name} vs {name}',
      params: { Name: 'John', name: 'jane' },
      expected: 'John vs jane',
      description: 'case-sensitive keys',
    },
  ])('should handle $description', ({ input, params, expected }) => {
    expect(namedLenientFormat(input, params)).toBe(expected);
  });

  it('should only match word characters in placeholder names', () => {
    // Test non-word characters in placeholder names
    expect(
      namedLenientFormat('Hello {name-test}', { 'name-test': 'John' })
    ).toBe('Hello {name-test}');

    expect(
      namedLenientFormat('Price: ${price} and {tax.rate}%', {
        price: '100',
        'tax.rate': '8.5',
      })
    ).toBe('Price: $100 and {tax.rate}%');

    expect(
      namedLenientFormat('Contact: {email@domain} or {phone#}', {
        'email@domain': 'test@example.com',
        'phone#': '555-1234',
      })
    ).toBe('Contact: {email@domain} or {phone#}');
  });

  it('should handle malformed placeholders gracefully', () => {
    expect(
      namedLenientFormat('Hello {name} {age world', { name: 'John', age: '25' })
    ).toBe('Hello John {age world');

    expect(
      namedLenientFormat('Hello {name} {123} world', { name: 'John' })
    ).toBe('Hello John {123} world');
  });
});

describe('getNamedKeys', () => {
  it.each<{
    input: string;
    expected: string[];
    description: string;
  }>([
    // Basic functionality
    {
      input: 'Hello {name}',
      expected: ['name'],
      description: 'single named key',
    },
    {
      input: 'Hello {name}, you are {age} years old',
      expected: ['name', 'age'],
      description: 'multiple named keys',
    },
    {
      input: '{first} {middle} {last}',
      expected: ['first', 'middle', 'last'],
      description: 'multiple keys in sequence',
    },
    // Empty cases
    {
      input: '',
      expected: [],
      description: 'empty string input',
    },
    {
      input: 'Hello world',
      expected: [],
      description: 'input with no placeholders',
    },
    // Special cases
    {
      input: '{name} and {name} are friends',
      expected: ['name', 'name'],
      description: 'duplicate named keys',
    },
    {
      input: 'User {user_id} has {total_2} items',
      expected: ['user_id', 'total_2'],
      description: 'keys with underscores and numbers',
    },
    {
      input: '{Name} vs {name}',
      expected: ['Name', 'name'],
      description: 'case-sensitive keys',
    },
    {
      input: 'Complex {userName} with {itemCount} and {userId}',
      expected: ['userName', 'itemCount', 'userId'],
      description: 'mixed camelCase and underscore keys',
    },
  ])('should handle $description', ({ input, expected }) => {
    expect(getNamedKeys(input)).toEqual(expected);
  });

  it('should only match word characters in placeholder names', () => {
    // Test non-word characters in placeholder names should not match
    expect(getNamedKeys('Hello {name-test}')).toEqual([]);
    expect(getNamedKeys('Price: ${price} and {tax.rate}%')).toEqual(['price']);
    expect(getNamedKeys('Contact: {email@domain} or {phone#}')).toEqual([]);
    expect(getNamedKeys('Invalid {user-name} but valid {userName}')).toEqual([
      'userName',
    ]);
  });

  it('should handle malformed placeholders gracefully', () => {
    expect(getNamedKeys('Hello {name} {age world')).toEqual(['name']);
    expect(getNamedKeys('Hello {name} age} world')).toEqual(['name']);
    expect(getNamedKeys('Hello name} {age} world')).toEqual(['age']);
    expect(getNamedKeys('{incomplete and {valid}')).toEqual(['valid']);
  });

  it('should handle numeric placeholders as word characters', () => {
    // Note: purely numeric placeholders are matched since \w includes digits
    expect(getNamedKeys('Hello {0} and {name}')).toEqual(['0', 'name']);
    expect(getNamedKeys('{123} vs {abc123}')).toEqual(['123', 'abc123']);
    expect(getNamedKeys('Mixed {0} {1} {name} {age}')).toEqual([
      '0',
      '1',
      'name',
      'age',
    ]);
  });

  it('should handle edge cases with braces', () => {
    expect(getNamedKeys('{}')).toEqual([]);
    expect(getNamedKeys('{ }')).toEqual([]);
    expect(getNamedKeys('{} {name} {}')).toEqual(['name']);
    expect(getNamedKeys('{{name}}')).toEqual(['name']);
    expect(getNamedKeys('{name}}')).toEqual(['name']);
  });
});

import { describe, it, expect, vi } from 'vitest';
import { helloWorld } from './index';

describe('helloWorld', () => {
  it('should log "hello world" to console', () => {
    // Mock console.log
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    // Call the function
    helloWorld();

    // Assert that console.log was called with the correct message
    expect(consoleSpy).toHaveBeenCalledWith('hello world');

    // Restore the original console.log
    consoleSpy.mockRestore();
  });
});

import { describe, it, expect } from 'vitest';

describe('Test environment setup', () => {
  it('vitest runs correctly', () => {
    expect(1 + 1).toBe(2);
  });

  it('fast-check is available', async () => {
    const fc = await import('fast-check');
    expect(fc).toBeDefined();
    expect(typeof fc.assert).toBe('function');
  });

  it('jsdom environment provides document', () => {
    expect(typeof document).toBe('object');
    expect(typeof document.createElement).toBe('function');
  });

  it('can create and manipulate DOM elements', () => {
    const div = document.createElement('div');
    div.innerHTML = '<p>hello</p>';
    expect(div.querySelector('p').textContent).toBe('hello');
  });
});

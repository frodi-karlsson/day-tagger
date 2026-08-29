import { afterEach, describe, expect, test, vi } from 'vitest';
import { inject, registerDI, resetDI } from './di.js';

class Example {
  value = 'real';
}

afterEach(() => {
  resetDI();
});

describe('inject', () => {
  test('should throw when the token is not registered', () => {
    expect(() => inject(Example)).toThrow('No DI registration for Example');
  });

  test('should return the registered instance', () => {
    const instance = new Example();
    registerDI(Example, () => instance);

    expect(inject(Example)).toBe(instance);
  });

  test('should build the instance only once', () => {
    const factory = vi.fn(() => new Example());
    registerDI(Example, factory);

    inject(Example);
    inject(Example);

    expect(factory).toHaveBeenCalledTimes(1);
  });

  test('should not build the instance until first use', () => {
    const factory = vi.fn(() => new Example());

    registerDI(Example, factory);

    expect(factory).not.toHaveBeenCalled();
  });
});

describe('registerDI', () => {
  test('should replace an earlier registration', () => {
    const replacement = new Example();
    registerDI(Example, () => new Example());

    registerDI(Example, () => replacement);

    expect(inject(Example)).toBe(replacement);
  });

  test('should drop an instance that was already built', () => {
    registerDI(Example, () => new Example());
    const first = inject(Example);

    registerDI(Example, () => new Example());

    expect(inject(Example)).not.toBe(first);
  });
});

describe('resetDI', () => {
  test('should remove every registration', () => {
    registerDI(Example, () => new Example());

    resetDI();

    expect(() => inject(Example)).toThrow();
  });
});

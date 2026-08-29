import { beforeEach, describe, expect, test } from 'vitest';
import { StorageService } from './storage.service';

let service: StorageService;

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  service = new StorageService();
});

describe('constructor', () => {
  test('should use the storage it is given', () => {
    const session = new StorageService(sessionStorage);

    session.write('scoped', 'yes');

    expect(sessionStorage.getItem('scoped')).toBe('"yes"');
    expect(localStorage.getItem('scoped')).toBeNull();
  });
});

describe('read', () => {
  test('should return null for a missing key', () => {
    expect(service.read('missing')).toBeNull();
  });

  test('should return null when the stored value is not valid json', () => {
    localStorage.setItem('broken', '{');

    expect(service.read('broken')).toBeNull();
  });
});

describe('write', () => {
  test('should round trip a value', () => {
    service.write('user', { name: 'ada' });

    expect(service.read('user')).toEqual({ name: 'ada' });
  });
});

describe('remove', () => {
  test('should clear a stored key', () => {
    service.write('temp', 1);

    service.remove('temp');

    expect(service.read('temp')).toBeNull();
  });
});

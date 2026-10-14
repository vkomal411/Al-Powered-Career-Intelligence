import { getApiBase, persistAccessToken, clearStoredSession } from '../lib/api';

describe('Frontend API Utility Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('getApiBase returns valid backend base URL', () => {
    const base = getApiBase();
    expect(base).toBeDefined();
    expect(typeof base).toBe('string');
    expect(base.length).toBeGreaterThan(0);
  });

  test('persistAccessToken saves token to localStorage', () => {
    const sampleToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sample';
    persistAccessToken(sampleToken);
    expect(localStorage.getItem('token')).toBe(sampleToken);
    expect(localStorage.getItem('auth_token')).toBe(sampleToken);
  });

  test('clearStoredSession removes tokens from localStorage', () => {
    localStorage.setItem('token', 'sample-token');
    localStorage.setItem('auth_token', 'sample-token');
    clearStoredSession();
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('auth_token')).toBeNull();
  });
});

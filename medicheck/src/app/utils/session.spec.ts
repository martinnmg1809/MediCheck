// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { clearSessionData, hasValidSession, saveSessionData } from './session';

describe('session helpers', () => {
  beforeEach(() => {
    clearSessionData();
  });

  it('requires both token and user id to consider the session valid', () => {
    saveSessionData({ token: 'abc123' });
    expect(hasValidSession()).toBe(false);

    saveSessionData({ token: 'abc123', userId: '42' });
    expect(hasValidSession()).toBe(true);
  });
});

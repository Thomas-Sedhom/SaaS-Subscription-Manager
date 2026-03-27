import { describe, expect, it } from 'vitest';

import {
  paymentStore,
  planStore,
  subscriptionStore,
  userStore
} from '../shared/database/in-memory-store';

describe('temporary data store', () => {
  it('exports shared in-memory collections while schema design is pending', () => {
    expect(Array.isArray(userStore)).toBe(true);
    expect(Array.isArray(planStore)).toBe(true);
    expect(Array.isArray(subscriptionStore)).toBe(true);
    expect(Array.isArray(paymentStore)).toBe(true);
  });
});
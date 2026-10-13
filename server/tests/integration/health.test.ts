import { describe, expect, it } from 'vitest';

import { createApiClient } from '#tests/support/api-client';

describe('GET /health', () => {
  it('returns 200', async () => {
    const response = await createApiClient().health();

    expect(response.status).toBe(200);
  });
});

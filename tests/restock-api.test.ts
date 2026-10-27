
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  update: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    produce: {
      update: mocks.update,
    },
  },
}));

import { PATCH } from '../src/app/api/produce/[id]/restock/route';

describe('PATCH /api/produce/[id]/restock', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('updates restock settings with valid input', async () => {
    const updatedProduce = {
      id: 2,
      restockTrigger: 'half',
      customThreshold: 5,
    };

    mocks.update.mockResolvedValue(updatedProduce);

    const request = {
      json: async () => ({
        restockTrigger: 'half',
        customThreshold: 5,
      }),
    } as Request;

    const response = await PATCH(request, {
      params: { id: '2' },
    });

    expect(response.status).toBe(200);
    expect(mocks.update).toHaveBeenCalledWith({
      where: { id: 2 },
      data: {
        restockTrigger: 'half',
        customThreshold: 5,
      },
    });
  });

  it('returns an error when the database update fails', async () => {
    mocks.update.mockRejectedValue(new Error('Database error'));

    const request = {
      json: async () => ({
        restockTrigger: 'half',
        customThreshold: 5,
      }),
    } as Request;

    const response = await PATCH(request, {
      params: { id: '2' },
    });

    expect(response.status).toBe(500);
  });
});

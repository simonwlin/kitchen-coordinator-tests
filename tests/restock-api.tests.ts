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
    mocks.update.mockResolvedValue({
      id: 2,
      restockTrigger: 'half',
      customThreshold: 5,
    });

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

  it('rejects a non-numeric produce ID', async () => {
    const request = {
      json: async () => ({ restockTrigger: 'half' }),
    } as Request;

    const response = await PATCH(request, {
      params: { id: 'abc' },
    });

    expect(response.status).toBe(400);
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it('rejects an invalid restock trigger', async () => {
    const request = {
      json: async () => ({ restockTrigger: 'invalid' }),
    } as Request;

    const response = await PATCH(request, {
      params: { id: '2' },
    });

    expect(response.status).toBe(400);
    expect(mocks.update).not.toHaveBeenCalled();
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

  it('rejects a non-numeric produce ID', async () => {
    const request = {
      json: async () => ({ restockTrigger: 'half' }),
    } as Request;

    const response = await PATCH(request, {
      params: { id: 'abc' },
    });

    expect(response.status).toBe(400);
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it('rejects an invalid restock trigger', async () => {
    const request = {
      json: async () => ({ restockTrigger: 'invalid' }),
    } as Request;

    const response = await PATCH(request, {
      params: { id: '2' },
    });

    expect(response.status).toBe(400);
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it('rejects a negative custom threshold', async () => {
    const request = {
      json: async () => ({
        restockTrigger: 'custom',
        customThreshold: -5,
      }),
    } as Request;

    const response = await PATCH(request, {
      params: { id: '2' },
    });

    expect(response.status).toBe(400);
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it('rejects SQL-injection-like threshold input', async () => {
    const request = {
      json: async () => ({
        restockTrigger: 'custom',
        customThreshold: '1; DROP TABLE produce;',
      }),
    } as Request;

    const response = await PATCH(request, {
      params: { id: '2' },
    });

    expect(response.status).toBe(400);
    expect(mocks.update).not.toHaveBeenCalled();
  });
});
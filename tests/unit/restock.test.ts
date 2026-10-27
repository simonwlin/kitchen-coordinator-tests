import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  produceFindUnique: vi.fn(),
  shoppingListFindFirst: vi.fn(),
  shoppingListCreate: vi.fn(),
  shoppingListItemFindFirst: vi.fn(),
  shoppingListItemCreate: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    produce: { findUnique: mocks.produceFindUnique },
    shoppingList: {
      findFirst: mocks.shoppingListFindFirst,
      create: mocks.shoppingListCreate,
    },
    shoppingListItem: {
      findFirst: mocks.shoppingListItemFindFirst,
      create: mocks.shoppingListItemCreate,
    },
  },
}));

import { checkAndAddToShoppingList } from '@/lib/restock';

describe('checkAndAddToShoppingList', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.shoppingListFindFirst.mockResolvedValue(null);
    mocks.shoppingListCreate.mockResolvedValue({
      id: 1,
      name: 'Auto Restock List',
      owner: 'user1',
    });
    mocks.shoppingListItemFindFirst.mockResolvedValue(null);
    mocks.shoppingListItemCreate.mockResolvedValue({});
  });

  it('does nothing when produce does not exist', async () => {
    mocks.produceFindUnique.mockResolvedValue(null);

    await checkAndAddToShoppingList(999, 'user1');

    expect(mocks.shoppingListCreate).not.toHaveBeenCalled();
    expect(mocks.shoppingListItemCreate).not.toHaveBeenCalled();
  });

  it('adds an empty produce item to the shopping list', async () => {
    mocks.produceFindUnique.mockResolvedValue({
      id: 1,
      name: 'Apple',
      quantity: 0,
      restockTrigger: 'empty',
    });

    await checkAndAddToShoppingList(1, 'user1');

    expect(mocks.shoppingListCreate).toHaveBeenCalledOnce();
    expect(mocks.shoppingListItemCreate).toHaveBeenCalledWith({
      data: {
        shoppingListId: 1,
        name: 'Apple',
        quantity: 1,
      },
    });
  });

  it('does not add an item when it is already on the list', async () => {
    mocks.produceFindUnique.mockResolvedValue({
      id: 1,
      name: 'Apple',
      quantity: 0,
      restockTrigger: 'empty',
    });
    mocks.shoppingListFindFirst.mockResolvedValue({
      id: 1,
      name: 'Auto Restock List',
      owner: 'user1',
    });
    mocks.shoppingListItemFindFirst.mockResolvedValue({
      id: 10,
      name: 'Apple',
      shoppingListId: 1,
    });

    await checkAndAddToShoppingList(1, 'user1');

    expect(mocks.shoppingListItemCreate).not.toHaveBeenCalled();
  });

  it('does not create a shopping list when restocking is unnecessary', async () => {
    mocks.produceFindUnique.mockResolvedValue({
      id: 3,
      name: 'Carrot',
      quantity: 10,
      restockTrigger: 'custom',
      customThreshold: 5,
    });

    await checkAndAddToShoppingList(3, 'user1');

    expect(mocks.shoppingListCreate).not.toHaveBeenCalled();
    expect(mocks.shoppingListItemCreate).not.toHaveBeenCalled();
  });
});
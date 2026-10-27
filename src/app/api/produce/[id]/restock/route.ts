import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const id = Number(params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { error: 'Invalid produce ID' },
        { status: 400 },
      );
    }

    const { restockTrigger, customThreshold } = await request.json();

    const validTriggers = ['empty', 'half', 'custom'];

    if (
      restockTrigger !== undefined
      && !validTriggers.includes(restockTrigger)
    ) {
      return NextResponse.json(
        { error: 'Invalid restock trigger' },
        { status: 400 },
      );
    }

    const updateData: {
      restockTrigger?: string;
      customThreshold?: number;
    } = {};

    if (restockTrigger !== undefined) {
      updateData.restockTrigger = restockTrigger;
    }

    if (customThreshold !== undefined) {
      const threshold = Number(customThreshold);

      if (
        customThreshold === ''
        || customThreshold === null
        || !Number.isFinite(threshold)
        || threshold < 0
      ) {
        return NextResponse.json(
          { error: 'Invalid custom threshold' },
          { status: 400 },
        );
      }

      updateData.customThreshold = threshold;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No restock settings provided' },
        { status: 400 },
      );
    }

    const updatedProduce = await prisma.produce.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedProduce, { status: 200 });
  } catch (error) {
    console.error('Error updating produce restock info:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

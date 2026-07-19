import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    const workerTypes = await prisma.workerType.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ workerTypes });
  } catch (error) {
    console.error('Error fetching worker types:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, schedule } = await req.json();
    if (!name) {
      return NextResponse.json({ error: 'Missing name' }, { status: 400 });
    }

    const existing = await prisma.workerType.findUnique({
      where: { name },
    });

    if (existing) {
      return NextResponse.json({ error: 'Este tipo ya existe' }, { status: 400 });
    }

    const workerType = await prisma.workerType.create({
      data: { name, schedule },
    });

    return NextResponse.json({ workerType });
  } catch (error) {
    console.error('Error creating worker type:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

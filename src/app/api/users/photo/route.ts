import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { photoUrl } = await req.json();
    if (!photoUrl) {
      return NextResponse.json({ error: 'Missing photoUrl' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: (session.user as any).id },
      data: { photoUrl }
    });

    return NextResponse.json({ success: true, photoUrl });
  } catch (error) {
    console.error('Error updating photo:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

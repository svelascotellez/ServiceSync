import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const workerType = await prisma.workerType.findUnique({
      where: { id },
    });

    if (!workerType) {
      return NextResponse.json({ error: 'Tipo no encontrado' }, { status: 404 });
    }

    // Check if in use
    const usersWithRole = await prisma.user.findFirst({
      where: { workerType: workerType.name },
    });

    if (usersWithRole) {
      return NextResponse.json({ 
        error: `No se puede eliminar. Hay trabajadores asignados a "${workerType.name}". Por favor cámbiales el tipo primero.` 
      }, { status: 400 });
    }

    await prisma.workerType.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting worker type:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, schedule } = await req.json();

    const updatedWorkerType = await prisma.workerType.update({
      where: { id: params.id },
      data: { name, schedule },
    });

    return NextResponse.json({ success: true, workerType: updatedWorkerType });
  } catch (error: any) {
    console.error('Error updating worker type:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

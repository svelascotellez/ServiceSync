import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { startPhotoUrl, startPhotoTime, startPhotoLat, startPhotoLng } = await req.json();

    const task = await prisma.task.findUnique({ where: { id: params.id } });
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (task.dueDate) {
      const getLocalDateString = () => {
        const d = new Date();
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().split('T')[0];
      };
      const todayDateStr = getLocalDateString();
      const taskDateStr = task.dueDate.toISOString().split('T')[0];

      if (taskDateStr !== todayDateStr) {
        return NextResponse.json({ error: 'No puedes iniciar tareas que no estén programadas para hoy.' }, { status: 400 });
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data: {
        status: 'in-progress',
        startPhotoUrl,
        startPhotoTime: startPhotoTime ? new Date(startPhotoTime) : null,
        startPhotoLat,
        startPhotoLng,
      },
    });

    return NextResponse.json({ success: true, task: updatedTask });
  } catch (error: any) {
    console.error('Error starting task:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

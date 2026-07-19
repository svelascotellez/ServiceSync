import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, location, assignedToId, priority, status, updateSeries } = await req.json();

    // Fetch the task first to check its recurringGroupId
    const existingTask = await prisma.task.findUnique({ where: { id: params.id } });
    
    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (updateSeries && existingTask.recurringGroupId) {
      // Update all INCOMPLETE tasks in the series
      await prisma.task.updateMany({
        where: {
          recurringGroupId: existingTask.recurringGroupId,
          status: 'pending', // Only update pending tasks, don't mess with completed ones
        },
        data: {
          title,
          description,
          location,
          assignedToId: assignedToId || null,
          priority,
        },
      });

      // Update the current task status (in case they also marked the current one as completed)
      const updatedTask = await prisma.task.update({
        where: { id: params.id },
        data: { status }
      });

      return NextResponse.json({ success: true, task: updatedTask });
    } else {
      // Update just this one task
      const updatedTask = await prisma.task.update({
        where: { id: params.id },
        data: {
          title,
          description,
          location,
          assignedToId: assignedToId || null,
          priority,
          status,
        },
      });

      return NextResponse.json({ success: true, task: updatedTask });
    }
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const deleteSeries = searchParams.get('deleteSeries') === 'true';

    const existingTask = await prisma.task.findUnique({ where: { id: params.id } });

    if (existingTask && deleteSeries && existingTask.recurringGroupId) {
      await prisma.task.deleteMany({
        where: {
          recurringGroupId: existingTask.recurringGroupId,
          status: 'pending',
        }
      });
    } else {
      await prisma.task.delete({
        where: { id: params.id },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

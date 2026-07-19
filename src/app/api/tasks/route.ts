import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tasks = await prisma.task.findMany({
      include: {
        assignedTo: { select: { id: true, name: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ tasks });
  } catch (error: any) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, location, assignedToId, priority, dueDate, recurrence, recurringDays, recurringEndDate } = await req.json();

    if (!title || !location || !assignedToId || !dueDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (recurrence === 'recurring') {
      const groupId = crypto.randomUUID();
      const parsedDays = JSON.parse(recurringDays || '[]');
      const end = recurringEndDate ? new Date(recurringEndDate) : new Date(Date.now() + 1000 * 60 * 60 * 24 * 30 * 6); // 6 months limit for "unlimited"
      
      let currentDate = new Date(dueDate);
      const tasksToCreate = [];

      while (currentDate <= end) {
        if (parsedDays.includes(currentDate.getDay().toString()) || parsedDays.includes(currentDate.getDay())) {
          tasksToCreate.push({
            title,
            description,
            location,
            priority: priority || 'Medium',
            assignedToId,
            createdById: (session.user as any).id,
            status: 'pending',
            dueDate: new Date(currentDate),
            recurrence: 'recurring',
            recurringGroupId: groupId,
            recurringDays,
            recurringEndDate: end
          });
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      if (tasksToCreate.length === 0) {
        return NextResponse.json({ error: 'No se generaron tareas con esos días' }, { status: 400 });
      }

      await prisma.task.createMany({ data: tasksToCreate });
      return NextResponse.json({ success: true, count: tasksToCreate.length });
    } else {
      const newTask = await prisma.task.create({
        data: {
          title,
          description,
          location,
          priority: priority || 'Medium',
          assignedToId,
          createdById: (session.user as any).id,
          status: 'pending',
          dueDate: new Date(dueDate),
          recurrence: 'once',
        },
        include: {
          assignedTo: { select: { name: true } }
        }
      });
      return NextResponse.json({ success: true, task: newTask });
    }
  } catch (error: any) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

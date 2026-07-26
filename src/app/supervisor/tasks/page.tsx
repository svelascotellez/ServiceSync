import { prisma } from '@/lib/prisma';
import TasksClient from '@/app/dashboard/tasks/TasksClient';

export const dynamic = 'force-dynamic';

export default async function SupervisorTasksPage() {
  const tasks = await prisma.task.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      location: true,
      status: true,
      priority: true,
      dueDate: true,
      recurringGroupId: true,
      startPhotoUrl: true,
      endPhotoUrl: true,
      assignedTo: {
        select: {
          id: true,
          name: true,
        }
      }
    },
    orderBy: [
      { dueDate: 'asc' },
      { createdAt: 'desc' }
    ]
  });

  const workers = await prisma.user.findMany({
    where: { role: 'worker' },
    select: {
      id: true,
      name: true,
      workerType: true,
    }
  });

  return <TasksClient tasks={JSON.parse(JSON.stringify(tasks))} workers={JSON.parse(JSON.stringify(workers))} />;
}

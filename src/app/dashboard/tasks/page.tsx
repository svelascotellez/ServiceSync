import { prisma } from '@/lib/prisma';
import TasksClient from './TasksClient';

export const dynamic = 'force-dynamic';

export default async function TasksPage() {
  // Fetch tasks
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

  // Fetch workers to populate the "Assign to" dropdown
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

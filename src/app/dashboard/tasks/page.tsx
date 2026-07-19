import { prisma } from '@/lib/prisma';
import TasksClient from './TasksClient';

export default async function TasksPage() {
  // Fetch tasks
  const tasks = await prisma.task.findMany({
    include: {
      assignedTo: {
        select: {
          id: true,
          name: true,
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
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

  return <TasksClient tasks={tasks} workers={workers} />;
}

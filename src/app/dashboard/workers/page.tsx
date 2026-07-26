import { prisma } from '@/lib/prisma';
import WorkersClient from './WorkersClient';

export const dynamic = 'force-dynamic';

export default async function WorkersPage() {
  const workers = await prisma.user.findMany({
    where: { role: 'worker' },
    orderBy: { name: 'asc' },
    include: {
      assignedTasks: {
        orderBy: { dueDate: 'desc' },
        take: 20
      },
      attendances: {
        orderBy: { date: 'desc' },
        take: 20
      }
    }
  });

  return <WorkersClient workers={JSON.parse(JSON.stringify(workers))} />;
}

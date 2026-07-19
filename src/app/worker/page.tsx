import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import WorkerClient from './WorkerClient';

export default async function WorkerPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({ where: { email: session.user?.email || '' } });
  
  if (!user || user.role !== 'worker') {
    redirect('/login');
  }

  // Fetch tasks assigned to this worker for today or in general
  const tasks = await prisma.task.findMany({
    where: { assignedToId: user.id },
    orderBy: { createdAt: 'desc' }
  });

  return <WorkerClient tasks={tasks} />;
}

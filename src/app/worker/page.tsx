import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import WorkerClient from './WorkerClient';

export default async function WorkerPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect('/login');
  }

  const role = (session.user as any).role;
  if (role !== 'worker') {
    if (role === 'admin') redirect('/dashboard');
    if (role === 'supervisor') redirect('/supervisor');
    if (role === 'resident') redirect('/resident');
    redirect('/login');
  }

  const userId = (session.user as any).id;
  const userEmail = (session.user.email || '').trim().toLowerCase();

  let user = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;
  if (!user && userEmail) {
    const allUsers = await prisma.user.findMany();
    user = allUsers.find(u => u.email.trim().toLowerCase() === userEmail) || null;
  }

  const workerId = user ? user.id : userId;

  const tasks = workerId ? await prisma.task.findMany({
    where: { assignedToId: workerId },
    orderBy: { createdAt: 'desc' }
  }) : [];

  return <WorkerClient tasks={JSON.parse(JSON.stringify(tasks))} />;
}

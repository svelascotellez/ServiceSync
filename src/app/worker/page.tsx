import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import WorkerClient from './WorkerClient';

export const dynamic = 'force-dynamic';

export default async function WorkerPage() {
  try {
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

    let user = null;
    if (userId && typeof userId === 'string') {
      user = await prisma.user.findUnique({ where: { id: userId } }).catch(() => null);
    }
    if (!user && userEmail) {
      const allUsers = await prisma.user.findMany().catch(() => []);
      user = allUsers.find(u => u.email.trim().toLowerCase() === userEmail) || null;
    }

    const workerId = user ? user.id : (typeof userId === 'string' ? userId : null);

    const tasks = workerId ? await prisma.task.findMany({
      where: { assignedToId: workerId },
      orderBy: { createdAt: 'desc' }
    }).catch(() => []) : [];

    return <WorkerClient tasks={JSON.parse(JSON.stringify(tasks))} />;
  } catch (err: any) {
    if (
      err.message === 'NEXT_REDIRECT' || 
      err.digest?.startsWith('NEXT_REDIRECT') ||
      err.digest === 'DYNAMIC_SERVER_USAGE'
    ) {
      throw err;
    }
    console.error('Error rendering WorkerPage:', err);
    return <WorkerClient tasks={[]} />;
  }
}

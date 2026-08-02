import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import WorkerClient from './WorkerClient';

export const dynamic = 'force-dynamic';

export default async function WorkerPage() {
  try {
    const session = await getServerSession(authOptions).catch(() => null);
    const userId = (session?.user as any)?.id;
    const userEmail = (session?.user?.email || '').trim().toLowerCase();

    let user = null;
    if (userId && typeof userId === 'string') {
      user = await prisma.user.findUnique({ where: { id: userId } }).catch(() => null);
    }
    if (!user && userEmail) {
      const allUsers = await prisma.user.findMany().catch(() => []);
      user = allUsers.find(u => u && u.email && u.email.trim().toLowerCase() === userEmail) || null;
    }

    const workerId = user ? user.id : (typeof userId === 'string' ? userId : null);

    const tasks = workerId ? await prisma.task.findMany({
      where: { assignedToId: workerId },
      orderBy: { createdAt: 'desc' }
    }).catch(() => []) : [];

    return <WorkerClient tasks={JSON.parse(JSON.stringify(tasks))} />;
  } catch (err: any) {
    console.error('Error rendering WorkerPage:', err);
    return <WorkerClient tasks={[]} />;
  }
}

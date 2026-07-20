import { prisma } from '@/lib/prisma';
import ResidentClient from './ResidentClient';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ResidentDashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== 'resident') {
    redirect('/login');
  }

  const tasks = await prisma.task.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      location: true,
      createdAt: true,
      rating: true,
      assignedTo: {
        select: {
          name: true
        }
      }
    }
  });

  return <ResidentClient tasks={JSON.parse(JSON.stringify(tasks))} />;
}

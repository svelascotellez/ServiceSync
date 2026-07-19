import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import TaskDetailClient from './TaskDetailClient';

export default async function TaskDetailPage(props: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  const params = await props.params;

  const task = await prisma.task.findUnique({
    where: { id: params.id },
  });
  
  if (!task) {
    redirect('/worker');
  }

  return <TaskDetailClient task={task} />;
}

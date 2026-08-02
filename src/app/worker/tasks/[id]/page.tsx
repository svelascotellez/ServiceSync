import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';
import TaskDetailClient from './TaskDetailClient';

export default async function TaskDetailPage(props: { params: Promise<{ id: string }> }) {
  const session = await getServerSession().catch(() => null);
  const params = await props.params;

  const task = await prisma.task.findUnique({
    where: { id: params.id },
  }).catch(() => null);
  
  if (!task) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Tarea no encontrada</div>;
  }

  return <TaskDetailClient task={JSON.parse(JSON.stringify(task))} />;
}

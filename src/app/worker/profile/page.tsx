import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';
import ProfileClient from './ProfileClient';

export default async function ProfilePage() {
  const session = await getServerSession().catch(() => null);
  const userEmail = session?.user?.email || '';

  const user = userEmail ? await prisma.user.findUnique({
    where: { email: userEmail }
  }).catch(() => null) : null;

  const completedTasks = user ? await prisma.task.count({
    where: {
      assignedToId: user.id,
      status: { in: ['completed', 'approved'] }
    }
  }).catch(() => 0) : 0;

  const tasksWithRating = user ? await prisma.task.findMany({
    where: {
      assignedToId: user.id,
      rating: { not: null }
    },
    select: { rating: true }
  }).catch(() => []) : [];

  const avgRating = tasksWithRating.length > 0 
    ? (tasksWithRating.reduce((acc, curr) => acc + (curr.rating || 0), 0) / tasksWithRating.length).toFixed(1)
    : '-';

  const stats = {
    completedTasks,
    avgRating,
    joinDate: user ? user.createdAt.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }) : '2026'
  };

  return <ProfileClient initialPhotoUrl={user?.photoUrl || null} user={JSON.parse(JSON.stringify(user || {}))} stats={stats} />;
}

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import ProfileClient from './ProfileClient';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user?.email || '' }
  });

  if (!user || user.role !== 'worker') {
    redirect('/login');
  }

  // Calculate real stats
  const completedTasks = await prisma.task.count({
    where: {
      assignedToId: user.id,
      status: { in: ['completed', 'approved'] }
    }
  });

  const tasksWithRating = await prisma.task.findMany({
    where: {
      assignedToId: user.id,
      rating: { not: null }
    },
    select: { rating: true }
  });

  const avgRating = tasksWithRating.length > 0 
    ? (tasksWithRating.reduce((acc, curr) => acc + (curr.rating || 0), 0) / tasksWithRating.length).toFixed(1)
    : '-';

  const stats = {
    completedTasks,
    avgRating,
    joinDate: user.createdAt.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })
  };

  return <ProfileClient initialPhotoUrl={user.photoUrl} user={user} stats={stats} />;
}

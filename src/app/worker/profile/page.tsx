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

  return <ProfileClient initialPhotoUrl={user.photoUrl} user={user} />;
}

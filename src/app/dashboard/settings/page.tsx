import SettingsClient from './SettingsClient';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  
  // Debug logic
  if (!session) {
    redirect('/login');
  }

  const workerTypes = await prisma.workerType.findMany({
    orderBy: { name: 'asc' },
  });

  return <SettingsClient initialWorkerTypes={workerTypes} />;
}

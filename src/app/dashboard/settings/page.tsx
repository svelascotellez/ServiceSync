import SettingsClient from './SettingsClient';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const session = await getServerSession().catch(() => null);

  const workerTypes = await prisma.workerType.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, schedule: true }
  }).catch(() => []);

  return <SettingsClient initialWorkerTypes={JSON.parse(JSON.stringify(workerTypes))} />;
}

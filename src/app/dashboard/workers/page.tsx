import { prisma } from '@/lib/prisma';
import WorkersClient from './WorkersClient';

export default async function WorkersPage() {
  const workers = await prisma.user.findMany({
    where: { role: 'worker' },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      workerType: true,
      photoUrl: true,
    }
  });

  return <WorkersClient workers={workers} />;
}

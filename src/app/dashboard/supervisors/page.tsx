import { prisma } from '@/lib/prisma';
import SupervisorsClient from './SupervisorsClient';

export const dynamic = 'force-dynamic';

export default async function SupervisorsPage() {
  const supervisors = await prisma.user.findMany({
    where: { role: 'supervisor' },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      photoUrl: true,
      createdAt: true,
    }
  });

  return <SupervisorsClient supervisors={JSON.parse(JSON.stringify(supervisors))} />;
}

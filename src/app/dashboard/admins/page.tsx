import { prisma } from '@/lib/prisma';
import AdminsClient from './AdminsClient';

export const dynamic = 'force-dynamic';

export default async function AdminsPage() {
  const admins = await prisma.user.findMany({
    where: { role: { in: ['admin', 'supervisor'] } },
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

  return <AdminsClient admins={JSON.parse(JSON.stringify(admins))} />;
}

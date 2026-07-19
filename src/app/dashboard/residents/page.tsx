import { prisma } from '@/lib/prisma';
import ResidentsClient from './ResidentsClient';

export const dynamic = 'force-dynamic';

export default async function ResidentsPage() {
  const residents = await prisma.user.findMany({
    where: { role: 'resident' },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      email: true,
      apartment: true,
    }
  });

  return <ResidentsClient residents={residents} />;
}

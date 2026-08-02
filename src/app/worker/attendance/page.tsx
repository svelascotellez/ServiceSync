import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';
import AttendanceClient from './AttendanceClient';

export default async function WorkerAttendancePage() {
  const session = await getServerSession().catch(() => null);
  const userEmail = session?.user?.email || '';

  const user = userEmail ? await prisma.user.findUnique({ where: { email: userEmail } }).catch(() => null) : null;
  
  const attendances = user ? await prisma.attendance.findMany({
    where: { workerId: user.id },
    orderBy: { date: 'desc' },
    take: 30
  }).catch(() => []) : [];

  return <AttendanceClient attendances={JSON.parse(JSON.stringify(attendances))} />;
}

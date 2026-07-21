import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import AttendanceClient from './AttendanceClient';

export default async function WorkerAttendancePage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({ where: { email: session.user?.email || '' } });
  
  if (!user || user.role !== 'worker') {
    redirect('/login');
  }

  const attendances = await prisma.attendance.findMany({
    where: { workerId: user.id },
    orderBy: { date: 'desc' },
    take: 30 // Fetch last 30 days
  });

  return <AttendanceClient attendances={attendances} />;
}

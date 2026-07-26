import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { AttendanceAdminClient } from '@/components/AttendanceAdminClient';

export default async function DashboardAttendancePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || (session.user as any).role !== 'admin') {
    redirect('/login');
  }

  const attendances = await prisma.attendance.findMany({
    include: {
      worker: {
        select: {
          id: true,
          name: true,
          email: true,
          photoUrl: true,
          workerType: true
        }
      }
    },
    orderBy: {
      date: 'desc'
    }
  });

  return <AttendanceAdminClient attendances={JSON.parse(JSON.stringify(attendances))} />;
}

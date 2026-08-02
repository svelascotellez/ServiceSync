import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AttendanceAdminClient } from '@/components/AttendanceAdminClient';

export default async function DashboardAttendancePage() {
  const session = await getServerSession().catch(() => null);

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
  }).catch(() => []);

  return <AttendanceAdminClient attendances={JSON.parse(JSON.stringify(attendances))} />;
}

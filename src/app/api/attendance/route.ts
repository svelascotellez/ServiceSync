import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== 'worker') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workerId = (session.user as any).id;

    // Get today's attendance record (from midnight to midnight)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attendance = await prisma.attendance.findFirst({
      where: {
        workerId,
        date: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    return NextResponse.json({ attendance });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== 'worker') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workerId = (session.user as any).id;
    const { 
      action, 
      photoUrl, 
      photoLat, 
      photoLng, 
      photoTime 
    } = await req.json(); // 'checkIn' or 'checkOut'

    // Get today's bounds
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        workerId,
        date: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    if (action === 'checkIn') {
      if (existingAttendance) {
        return NextResponse.json({ error: 'Already checked in today' }, { status: 400 });
      }
      
      let evaluation = 'A Tiempo';

      // Evaluate schedule
      const user = await prisma.user.findUnique({ where: { id: workerId } });
      if (user?.workerType) {
        const wt = await prisma.workerType.findUnique({ where: { name: user.workerType } });
        if (wt?.schedule) {
          try {
            const scheduleArr = JSON.parse(wt.schedule);
            const now = new Date();
            const currentDay = now.getDay();
            const dayConfig = scheduleArr.find((d: any) => d.day === currentDay);
            
            if (dayConfig && dayConfig.active && dayConfig.start) {
              const [sh, sm] = dayConfig.start.split(':').map(Number);
              const expectedTime = new Date(now);
              expectedTime.setHours(sh, sm, 0, 0);
              
              const diffMins = (now.getTime() - expectedTime.getTime()) / 60000;
              
              if (diffMins > 15) {
                evaluation = 'Retardo';
              }
            }
          } catch (e) {
            console.error('Error parsing schedule for evaluation', e);
          }
        }
      }

      const newAttendance = await prisma.attendance.create({
        data: {
          workerId,
          checkInTime: new Date(),
          evaluation,
          checkInPhotoUrl: photoUrl,
          checkInLat: photoLat,
          checkInLng: photoLng,
          checkInLocationTime: photoTime ? new Date(photoTime) : null,
        }
      });
      return NextResponse.json({ success: true, attendance: newAttendance });

    } else if (action === 'checkOut') {
      if (!existingAttendance) {
        return NextResponse.json({ error: 'Must check in first' }, { status: 400 });
      }
      if (existingAttendance.checkOutTime) {
        return NextResponse.json({ error: 'Already checked out today' }, { status: 400 });
      }

      const updated = await prisma.attendance.update({
        where: { id: existingAttendance.id },
        data: { 
          checkOutTime: new Date(), 
          status: 'Completed',
          checkOutPhotoUrl: photoUrl,
          checkOutLat: photoLat,
          checkOutLng: photoLng,
          checkOutLocationTime: photoTime ? new Date(photoTime) : null,
        }
      });
      return NextResponse.json({ success: true, attendance: updated });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

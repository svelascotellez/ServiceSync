import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, password, phone, workerType, apartment, photoUrl } = await req.json();

    const dataToUpdate: any = {
      name,
      email,
      phone: phone || null,
    };

    if (photoUrl) {
      dataToUpdate.photoUrl = photoUrl;
    }

    if (password) {
      dataToUpdate.passwordHash = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.findUnique({ where: { id: params.id } });
    
    if (user?.role === 'worker') {
      dataToUpdate.workerType = workerType;
    } else if (user?.role === 'resident') {
      dataToUpdate.apartment = apartment;
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete associated attendances
    await prisma.attendance.deleteMany({
      where: { workerId: params.id }
    });

    // We might have assigned tasks, we should unassign them or delete them
    // For simplicity, we just set assignedToId to null for tasks assigned to this user
    await prisma.task.updateMany({
      where: { assignedToId: params.id },
      data: { assignedToId: null }
    });

    // Delete user
    await prisma.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

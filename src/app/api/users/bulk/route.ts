import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { users, role } = await req.json();

    if (!users || !Array.isArray(users)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    const defaultPasswordHash = await bcrypt.hash('password123', 10);

    const createPromises = users.map(async (u: any) => {
      // Basic upsert or create to avoid crashing on duplicates
      const email = String(u.email).toLowerCase().trim();
      const name = String(u.name || 'Unknown');
      
      const data: any = {
        name,
        passwordHash: defaultPasswordHash,
        role: role,
        phone: u.phone ? String(u.phone) : null,
      };

      if (role === 'worker' && u.workerType) {
        data.workerType = String(u.workerType);
      }
      if (role === 'resident' && u.apartment) {
        data.apartment = String(u.apartment);
      }

      return prisma.user.upsert({
        where: { email },
        update: data,
        create: {
          email,
          ...data
        }
      });
    });

    await Promise.all(createPromises);

    return NextResponse.json({ success: true, message: `Imported ${users.length} users` });
  } catch (error: any) {
    console.error('Bulk upload error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

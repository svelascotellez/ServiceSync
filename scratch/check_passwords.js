import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function checkPasswords() {
  const users = await prisma.user.findMany();
  console.log('Total users in DB:', users.length);
  for (const user of users) {
    const isP123 = await bcrypt.compare('password123', user.passwordHash).catch(() => false);
    const isQ2026 = await bcrypt.compare('Quintana-2026$$', user.passwordHash).catch(() => false);
    const isQ2026Hash = await bcrypt.compare('Quintana-2026##', user.passwordHash).catch(() => false);
    console.log(`User: ${user.email} (${user.role}) | p123: ${isP123} | Q2026$$: ${isQ2026} | Q2026##: ${isQ2026Hash}`);
  }
}

checkPasswords().finally(() => process.exit(0));

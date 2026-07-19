const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('password123', 10);
  await prisma.user.update({
    where: { email: 'worker@servicesync.com' },
    data: { passwordHash: hash }
  });
  console.log('Password reset successfully.');
}

main().finally(() => prisma.$disconnect());

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({});

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@servicesync.com' },
    update: {},
    create: {
      email: 'admin@servicesync.com',
      name: 'System Admin',
      passwordHash,
      role: 'admin',
    },
  });

  // Worker
  const worker = await prisma.user.upsert({
    where: { email: 'worker@servicesync.com' },
    update: {},
    create: {
      email: 'worker@servicesync.com',
      name: 'Maria G.',
      passwordHash,
      role: 'worker',
      workerType: 'Cleaner',
      phone: '555-0101',
    },
  });

  // Resident
  const resident = await prisma.user.upsert({
    where: { email: 'resident@servicesync.com' },
    update: {},
    create: {
      email: 'resident@servicesync.com',
      name: 'Alice Smith',
      passwordHash,
      role: 'resident',
      apartment: 'Apt 4B',
    },
  });

  console.log('Seeded users:', { admin: admin.email, worker: worker.email, resident: resident.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

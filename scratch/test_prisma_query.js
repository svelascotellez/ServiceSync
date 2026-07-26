const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const email = 'admin@servicesync.com';
    const normalizedEmail = email.trim().toLowerCase();
    
    console.log('Testing findFirst with mode insensitive...');
    const user1 = await prisma.user.findFirst({
      where: { email: { equals: normalizedEmail, mode: 'insensitive' } }
    });
    console.log('User1 result:', user1 ? user1.email : null);
  } catch (err) {
    console.error('ERROR in findFirst with mode insensitive:', err);
  }

  try {
    const email = 'admin@servicesync.com';
    console.log('Testing findUnique...');
    const user2 = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });
    console.log('User2 result:', user2 ? user2.email : null);
  } catch (err) {
    console.error('ERROR in findUnique:', err);
  }
}

test().finally(() => prisma.$disconnect());

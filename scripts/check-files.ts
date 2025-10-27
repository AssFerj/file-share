// scripts/check-files.ts
import prisma from '../lib/prisma';

async function main() {
  const files = await prisma.file.findMany({
    select: {
      id: true,
      filename: true,
      ownerId: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  console.log('📁 All files in database:');
  files.forEach(f => {
    console.log(`  - ${f.filename} | Owner: ${f.ownerId || 'NULL'} | Created: ${f.createdAt}`);
  });

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      planId: true,
    }
  });

  console.log('\n👥 All users:');
  users.forEach(u => {
    console.log(`  - ${u.email} | ID: ${u.id} | Plan: ${u.planId || 'NULL'}`);
  });
}

main().finally(() => prisma.$disconnect());
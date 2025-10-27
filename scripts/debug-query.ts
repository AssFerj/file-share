// scripts/debug-query.ts
import prisma from '../lib/prisma';

async function main() {
  const userEmail = 'assisjuniorcam@gmail.com';
  
  const user = await prisma.user.findUnique({
    where: { email: userEmail }
  });

  if (!user) {
    console.log('❌ User not found');
    return;
  }

  console.log('👤 User Info:');
  console.log(`  ID: "${user.id}"`);
  console.log(`  ID type: ${typeof user.id}`);
  console.log(`  ID length: ${user.id.length}`);
  console.log();

  console.log('📁 All files in database:');
  const allFiles = await prisma.file.findMany({
    select: {
      id: true,
      filename: true,
      ownerId: true,
      deletedAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  allFiles.forEach(f => {
    console.log(`  File: ${f.filename}`);
    console.log(`    ownerId: "${f.ownerId}"`);
    console.log(`    ownerId type: ${typeof f.ownerId}`);
    console.log(`    ownerId === user.id: ${f.ownerId === user.id}`);
    console.log(`    deletedAt: ${f.deletedAt}`);
    console.log();
  });

  console.log('🔍 Testing query with exact user.id:');
  const filesWithUserId = await prisma.file.findMany({
    where: { 
      ownerId: user.id,
      deletedAt: null
    },
  });
  console.log(`  Found: ${filesWithUserId.length} files`);

  console.log('\n🔍 Testing query without deletedAt filter:');
  const filesWithoutDeletedFilter = await prisma.file.findMany({
    where: { 
      ownerId: user.id,
    },
  });
  console.log(`  Found: ${filesWithoutDeletedFilter.length} files`);

  console.log('\n🔍 Testing raw query:');
  const rawFiles = await prisma.file.findMany({
    where: { 
      ownerId: { equals: user.id },
    },
  });
  console.log(`  Found: ${rawFiles.length} files`);
}

main().finally(() => prisma.$disconnect());

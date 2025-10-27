// scripts/check-deleted.ts
import prisma from '../lib/prisma';

async function main() {
  const userId = '68fea55255e4859d0beafae5';

  console.log('📁 Files for user (including deleted):');
  
  const allFiles = await prisma.file.findMany({
    where: { ownerId: userId },
    select: {
      id: true,
      filename: true,
      ownerId: true,
      deletedAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  allFiles.forEach(f => {
    const status = f.deletedAt ? '❌ DELETED' : '✅ ACTIVE';
    console.log(`  ${status} - ${f.filename} | Created: ${f.createdAt}`);
    if (f.deletedAt) {
      console.log(`    Deleted at: ${f.deletedAt}`);
    }
  });

  console.log(`\nTotal: ${allFiles.length} files`);
  console.log(`Active: ${allFiles.filter(f => !f.deletedAt).length}`);
  console.log(`Deleted: ${allFiles.filter(f => f.deletedAt).length}`);
}

main().finally(() => prisma.$disconnect());

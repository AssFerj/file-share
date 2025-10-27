// scripts/restore-files.ts
import prisma from '../lib/prisma';

async function main() {
  const userId = '68fea55255e4859d0beafae5';

  console.log('🔄 Restoring deleted files for user...');
  
  const deletedFiles = await prisma.file.findMany({
    where: { 
      ownerId: userId,
      deletedAt: { not: null }
    },
  });

  console.log(`Found ${deletedFiles.length} deleted files`);

  for (const file of deletedFiles) {
    await prisma.file.update({
      where: { id: file.id },
      data: { deletedAt: null }
    });
    console.log(`  ✓ Restored: ${file.filename}`);
  }

  console.log('✅ Restoration complete!');
}

main().finally(() => prisma.$disconnect());

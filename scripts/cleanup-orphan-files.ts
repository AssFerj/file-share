// scripts/cleanup-orphan-files.ts
import prisma from '../lib/prisma';

async function main() {
  const orphans = await prisma.file.findMany({
    where: { ownerId: null }
  });

  console.log(`🗑️  Found ${orphans.length} orphan files`);

  for (const file of orphans) {
    await prisma.file.update({
      where: { id: file.id },
      data: { deletedAt: new Date() }
    });
    console.log(`  ✓ Marked ${file.filename} as deleted`);
  }

  console.log('✅ Cleanup complete!');
}

main().finally(() => prisma.$disconnect());
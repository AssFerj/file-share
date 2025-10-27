import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Check if Free Plan already exists
  let freePlan = await prisma.plan.findFirst({
    where: { name: 'Free' }
  });

  if (!freePlan) {
    freePlan = await prisma.plan.create({
      data: {
        name: 'Free',
        maxFileSize: 4 * 1024 * 1024 * 1024, // 4GB in bytes
        retentionHrs: 5, // 5 hours
        priceCents: 0,
      },
    });
    console.log('✅ Free plan created:', freePlan);
  } else {
    console.log('ℹ️  Free plan already exists:', freePlan);
  }

  // Check if Premium Plan already exists
  let premiumPlan = await prisma.plan.findFirst({
    where: { name: 'Premium' }
  });

  if (!premiumPlan) {
    premiumPlan = await prisma.plan.create({
      data: {
        name: 'Premium',
        maxFileSize: 50 * 1024 * 1024 * 1024, // 50GB
        retentionHrs: 720, // 30 days
        priceCents: 999, // $9.99
      },
    });
    console.log('✅ Premium plan created:', premiumPlan);
  } else {
    console.log('ℹ️  Premium plan already exists:', premiumPlan);
  }

  // Check if app config already exists
  let appConfig = await prisma.appConfig.findFirst({
    where: { key: 'FREE_PLAN_ID' }
  });

  if (!appConfig) {
    appConfig = await prisma.appConfig.create({
      data: {
        key: 'FREE_PLAN_ID',
        value: freePlan.id,
      },
    });
    console.log('✅ App config created');
  } else {
    // Update if the free plan ID changed
    await prisma.appConfig.update({
      where: { id: appConfig.id },
      data: { value: freePlan.id },
    });
    console.log('ℹ️  App config updated');
  }

  // Create admin user with Premium plan
  const adminEmail = 'assisjuniorcam@gmail.com';
  let adminUser = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!adminUser) {
    const passwordHash = await bcrypt.hash('123456', 10);
    adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Assis Junior',
        passwordHash,
        role: 'admin',
        planId: premiumPlan.id, // Admin gets Premium plan
      },
    });
    console.log('✅ Admin user created:', adminUser.email);
  } else {
    // Update existing admin to Premium plan
    await prisma.user.update({
      where: { email: adminEmail },
      data: { 
        planId: premiumPlan.id,
        role: 'admin'
      }
    });
    console.log('ℹ️  Admin user updated to Premium plan');
  }

  console.log('\n📝 Add this to your .env file:');
  console.log(`FREE_PLAN_ID="${freePlan.id}"`);
  console.log('\n👤 Admin credentials:');
  console.log(`Email: ${adminEmail}`);
  console.log(`Password: 123456`);
  console.log(`Plan: Premium (50GB, 30 days retention)`);

}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

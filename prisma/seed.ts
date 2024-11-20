// seed.ts
import { PrismaClient, UserRole, AdminRole, NotificationType, ActivityType } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function seedUsers() {
  // Create a regular user
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {
      email: 'user@example.com',
      first_name: 'John',
      last_name: 'Doe',
      password: await hash('password123', 10),
      is_email_verified: true,
      is_active: true,
      role: UserRole.USER,
    },
    create: {
      email: 'user@example.com',
      first_name: 'John',
      last_name: 'Doe',
      password: await hash('password123', 10),
      is_email_verified: true,
      is_active: true,
      role: UserRole.USER,
    },
  });
  console.log(`User created: ${user.email}`);

  // Create a premium user
  const premiumUser = await prisma.user.upsert({
    where: { email: 'premium@example.com' },
    update: {
      email: 'premium@example.com',
      first_name: 'Jane',
      last_name: 'Smith',
      password: await hash('password123', 10),
      is_email_verified: true,
      is_active: true,
      role: UserRole.PREMIUM,
    },
    create: {
      email: 'premium@example.com',
      first_name: 'Jane',
      last_name: 'Smith',
      password: await hash('password123', 10),
      is_email_verified: true,
      is_active: true,
      role: UserRole.PREMIUM,
    },
  });
  console.log(`Premium user created: ${premiumUser.email}`);

  // Create some notifications for users
  await prisma.notification.create({
    data: {
      message: 'Welcome to the platform!',
      type: NotificationType.SYSTEM,
      users: {
        connect: [{ id: user.id }, { id: premiumUser.id }]
      }
    }
  });
}

async function seedAdmins() {
  // Create basic admin
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@example.com' },
    update: {
      email: 'admin@example.com',
      password: await hash('admin123', 10),
      name: 'Admin User',
      role: AdminRole.ADMIN,
      is_active: true,
    },
    create: {
      email: 'admin@example.com',
      password: await hash('admin123', 10),
      name: 'Admin User',
      role: AdminRole.ADMIN,
      is_active: true,
    },
  });
  console.log(`Admin created: ${admin.email}`);

  // Create super admin
  const superAdmin = await prisma.admin.upsert({
    where: { email: 'superadmin@example.com' },
    update: {
      email: 'superadmin@example.com',
      password: await hash('superadmin123', 10),
      name: 'Super Admin User',
      role: AdminRole.SUPER_ADMIN,
      is_active: true,
    },
    create: {
      email: 'superadmin@example.com',
      password: await hash('superadmin123', 10),
      name: 'Super Admin User',
      role: AdminRole.SUPER_ADMIN,
      is_active: true,
    },
  });
  console.log(`Super Admin created: ${superAdmin.email}`);

  // Create activity logs for admins
  await prisma.activityLog.create({
    data: {
      action: 'System initialization',
      type: ActivityType.CREATE,
      admin_id: superAdmin.id,
    }
  });
}

async function seedPermissions() {
  const permissions = [
    { name: 'USER_READ', description: 'Can read user data' },
    { name: 'USER_WRITE', description: 'Can modify user data' },
    { name: 'USER_DELETE', description: 'Can delete users' },
    { name: 'ADMIN_READ', description: 'Can read admin data' },
    { name: 'ADMIN_WRITE', description: 'Can modify admin data' },
    { name: 'SETTINGS_READ', description: 'Can read settings' },
    { name: 'SETTINGS_WRITE', description: 'Can modify settings' },
  ];

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: permission,
      create: permission,
    });
  }
  console.log('Permissions seeded');

  // Assign all permissions to super admin
  const superAdmin = await prisma.admin.findUnique({
    where: { email: 'superadmin@example.com' }
  });

  if (superAdmin) {
    const allPermissions = await prisma.permission.findMany();
    await prisma.admin.update({
      where: { id: superAdmin.id },
      data: {
        permissions: {
          connect: allPermissions.map(p => ({ id: p.id }))
        }
      }
    });
  }
}

async function main() {
  try {
    await seedUsers();
    await seedAdmins();
    await seedPermissions();

    console.log('Seed completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


  
import { PrismaClient } from '@prisma/client';
import { SHA256  } from 'crypto-js'

const prisma = new PrismaClient();

async function main() {
  const password = SHA256('password123');
  const user = await prisma.user.upsert({
    where: { email: 'admin@admin.com' },
    update: {},
    create: {
      email: 'admin@admin.com',
      name: 'Admin',
      password: "123"
    },
  });
  console.log({ user });
}
main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
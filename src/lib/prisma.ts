import { PrismaClient } from '@prisma/client';

// PrismaClient 是可以附加到 `global` 对象的重量级单例
// 在开发环境中，这样可以防止每次热重载时创建新的连接

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma; 
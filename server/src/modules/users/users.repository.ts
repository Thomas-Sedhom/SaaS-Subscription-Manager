import { prisma } from '../../shared/database/prisma';
import { mapUserRecord } from '../../shared/database/prisma-mappers';

interface CreateUserInput {
  name: string;
  email: string;
  passwordHash: string;
  role?: 'USER' | 'ADMIN';
}

interface UpdateUserInput {
  name?: string;
  email?: string;
  passwordHash?: string;
}

const userDetailInclude = {
  subscriptions: {
    include: {
      plan: {
        include: {
          planFeatures: {
            include: {
              feature: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  }
} as const;

export class UsersRepository {
  async findAll() {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return users.map((user) => mapUserRecord(user));
  }

  async findById(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    return user ? mapUserRecord(user) : null;
  }

  async findByIdWithSubscriptions(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: userDetailInclude
    });
  }

  async findByEmail(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    return user ? mapUserRecord(user) : null;
  }

  async create(data: CreateUserInput) {
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
        role: data.role ?? 'USER'
      }
    });

    return mapUserRecord(user);
  }

  async update(id: string, data: UpdateUserInput) {
    const existingUser = await prisma.user.findUnique({ where: { id } });

    if (!existingUser) {
      return null;
    }

    const user = await prisma.user.update({
      where: { id },
      data
    });

    return mapUserRecord(user);
  }
}

import { prisma } from '../../shared/database/prisma';
import { mapUserRecord } from '../../shared/database/prisma-mappers';
import { useInMemoryDatabase } from '../../config/env';
import type { UserRole } from '../../shared/database/in-memory-store';
import { createId, userStore } from '../../shared/database/in-memory-store';

interface CreateUserInput {
  name: string;
  email: string;
  passwordHash: string;
  role?: UserRole;
}

interface UpdateUserInput {
  name?: string;
  email?: string;
  passwordHash?: string;
}

export class UsersRepository {
  async findAll() {
    if (useInMemoryDatabase) {
      return [...userStore].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    const users = await prisma!.user.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return users.map((user) => mapUserRecord(user));
  }

  async findById(id: string) {
    if (useInMemoryDatabase) {
      return userStore.find((user) => user.id === id) ?? null;
    }

    const user = await prisma!.user.findUnique({ where: { id } });
    return user ? mapUserRecord(user) : null;
  }

  async findByEmail(email: string) {
    if (useInMemoryDatabase) {
      return userStore.find((user) => user.email === email) ?? null;
    }

    const user = await prisma!.user.findUnique({ where: { email } });
    return user ? mapUserRecord(user) : null;
  }

  async create(data: CreateUserInput) {
    if (useInMemoryDatabase) {
      const now = new Date();
      const user = {
        id: createId('user'),
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
        role: data.role ?? 'USER',
        createdAt: now,
        updatedAt: now
      };

      userStore.push(user);
      return user;
    }

    const user = await prisma!.user.create({
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
    if (useInMemoryDatabase) {
      const user = userStore.find((entry) => entry.id === id);

      if (!user) {
        return null;
      }

      Object.assign(user, data, {
        updatedAt: new Date()
      });

      return user;
    }

    const existingUser = await prisma!.user.findUnique({ where: { id } });

    if (!existingUser) {
      return null;
    }

    const user = await prisma!.user.update({
      where: { id },
      data
    });

    return mapUserRecord(user);
  }
}

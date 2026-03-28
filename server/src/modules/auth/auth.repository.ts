import { prisma } from '../../shared/database/prisma';
import { mapUserRecord } from '../../shared/database/prisma-mappers';

interface CreateUserInput {
  name: string;
  email: string;
  passwordHash: string;
  role?: 'USER' | 'ADMIN';
}

export class AuthRepository {
  async findByEmail(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    return user ? mapUserRecord(user) : null;
  }

  async findById(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
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
}

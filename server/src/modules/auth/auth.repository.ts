import type { UserRole } from '../../shared/database/in-memory-store';
import { createId, userStore } from '../../shared/database/in-memory-store';

interface CreateUserInput {
  name: string;
  email: string;
  passwordHash: string;
  role?: UserRole;
}

export class AuthRepository {
  findByEmail(email: string) {
    return Promise.resolve(userStore.find((user) => user.email === email) ?? null);
  }

  findById(id: string) {
    return Promise.resolve(userStore.find((user) => user.id === id) ?? null);
  }

  create(data: CreateUserInput) {
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
    return Promise.resolve(user);
  }
}
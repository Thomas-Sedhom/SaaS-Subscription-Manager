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
  findAll() {
    return Promise.resolve([...userStore].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
  }

  findById(id: string) {
    return Promise.resolve(userStore.find((user) => user.id === id) ?? null);
  }

  findByEmail(email: string) {
    return Promise.resolve(userStore.find((user) => user.email === email) ?? null);
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

  update(id: string, data: UpdateUserInput) {
    const user = userStore.find((entry) => entry.id === id);

    if (!user) {
      return Promise.resolve(null);
    }

    Object.assign(user, data, {
      updatedAt: new Date()
    });

    return Promise.resolve(user);
  }
}
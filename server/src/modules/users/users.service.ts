import bcrypt from 'bcrypt';

import { HTTP_STATUS } from '../../shared/constants/http-status';
import { AppError } from '../../shared/errors/app-error';
import type { AuthenticatedRequestUser } from '../../shared/types/common.types';
import type { CreateUserDto } from './dto/create-user.dto';
import type { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';

export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  listUsers() {
    return this.usersRepository.findAll();
  }

  async createUser(payload: CreateUserDto) {
    const existingUser = await this.usersRepository.findByEmail(payload.email);

    if (existingUser) {
      throw new AppError('A user with this email already exists', HTTP_STATUS.CONFLICT);
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);

    return this.usersRepository.create({
      name: payload.name,
      email: payload.email,
      passwordHash,
      role: payload.role
    });
  }

  async getProfile(currentUser: AuthenticatedRequestUser) {
    const user = await this.usersRepository.findById(currentUser.id);

    if (!user) {
      throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
    }

    return user;
  }

  async updateProfile(currentUser: AuthenticatedRequestUser, payload: UpdateUserDto) {
    const user = await this.usersRepository.findById(currentUser.id);

    if (!user) {
      throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
    }

    const data: {
      name?: string;
      email?: string;
      passwordHash?: string;
    } = {};

    if (payload.name) {
      data.name = payload.name;
    }

    if (payload.email && payload.email !== user.email) {
      const existingUser = await this.usersRepository.findByEmail(payload.email);
      if (existingUser) {
        throw new AppError('A user with this email already exists', HTTP_STATUS.CONFLICT);
      }
      data.email = payload.email;
    }

    if (payload.password) {
      data.passwordHash = await bcrypt.hash(payload.password, 10);
    }

    return this.usersRepository.update(currentUser.id, data);
  }
}

export const usersService = new UsersService(new UsersRepository());
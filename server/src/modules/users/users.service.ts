import bcrypt from 'bcrypt';

import { HTTP_STATUS } from '../../shared/constants/http-status';
import { AppError } from '../../shared/errors/app-error';
import type { AuthenticatedRequestUser } from '../../shared/types/common.types';
import type { CreateUserDto } from './dto/create-user.dto';
import type { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';
import type { UserResponse } from './users.types';

export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async listUsers(): Promise<UserResponse[]> {
    const users = await this.usersRepository.findAll();
    return users.map((user) => this.toUserResponse(user));
  }

  async getUserById(userId: string): Promise<UserResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
    }

    return this.toUserResponse(user);
  }

  async createUser(payload: CreateUserDto): Promise<UserResponse> {
    const existingUser = await this.usersRepository.findByEmail(payload.email);

    if (existingUser) {
      throw new AppError('A user with this email already exists', HTTP_STATUS.CONFLICT);
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);
    const user = await this.usersRepository.create({
      name: payload.name,
      email: payload.email,
      passwordHash,
      role: payload.role
    });

    return this.toUserResponse(user);
  }

  async getProfile(currentUser: AuthenticatedRequestUser): Promise<UserResponse> {
    const user = await this.usersRepository.findById(currentUser.id);

    if (!user) {
      throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
    }

    return this.toUserResponse(user);
  }

  async updateProfile(
    currentUser: AuthenticatedRequestUser,
    payload: UpdateUserDto
  ): Promise<UserResponse> {
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

    const updatedUser = await this.usersRepository.update(currentUser.id, data);

    if (!updatedUser) {
      throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
    }

    return this.toUserResponse(updatedUser);
  }

  private toUserResponse(user: {
    id: string;
    name: string;
    email: string;
    role: 'USER' | 'ADMIN';
    createdAt: Date;
    updatedAt: Date;
  }): UserResponse {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }
}

export const usersService = new UsersService(new UsersRepository());
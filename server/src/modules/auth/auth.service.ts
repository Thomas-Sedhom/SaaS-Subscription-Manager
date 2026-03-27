import bcrypt from 'bcrypt';

import { HTTP_STATUS } from '../../shared/constants/http-status';
import { AppError } from '../../shared/errors/app-error';
import { jwtService } from '../../shared/services/jwt.service';
import type { AuthenticatedRequestUser } from '../../shared/types/common.types';
import type { LoginDto, RegisterDto } from './dto/create-auth.dto';
import { AuthRepository } from './auth.repository';
import type { AuthResponse } from './auth.types';

export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async register(payload: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.authRepository.findByEmail(payload.email);

    if (existingUser) {
      throw new AppError('A user with this email already exists', HTTP_STATUS.CONFLICT);
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);
    const user = await this.authRepository.create({
      name: payload.name,
      email: payload.email,
      passwordHash
    });

    return this.buildAuthResponse(user);
  }

  async login(payload: LoginDto): Promise<AuthResponse> {
    const user = await this.authRepository.findByEmail(payload.email);

    if (!user) {
      throw new AppError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED);
    }

    const isPasswordValid = await bcrypt.compare(payload.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED);
    }

    return this.buildAuthResponse(user);
  }

  async getCurrentUser(currentUser: AuthenticatedRequestUser) {
    const user = await this.authRepository.findById(currentUser.id);

    if (!user) {
      throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };
  }

  private buildAuthResponse(user: {
    id: string;
    name: string;
    email: string;
    role: 'USER' | 'ADMIN';
  }): AuthResponse {
    const token = jwtService.createJWT({
      id: user.id,
      email: user.email,
      role: user.role
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    };
  }
}

export const authService = new AuthService(new AuthRepository());
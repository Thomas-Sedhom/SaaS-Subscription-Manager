export interface JwtPayload {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'USER' | 'ADMIN';
  };
  token: string;
}
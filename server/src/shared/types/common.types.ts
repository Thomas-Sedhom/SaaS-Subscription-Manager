export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: unknown;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface AuthenticatedRequestUser {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
}
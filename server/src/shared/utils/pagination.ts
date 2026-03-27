import type { PaginationQuery } from '../types/common.types';

export interface PaginationOptions {
  page: number;
  limit: number;
  skip: number;
}

export const getPagination = (query: PaginationQuery): PaginationOptions => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));

  return {
    page,
    limit,
    skip: (page - 1) * limit
  };
};
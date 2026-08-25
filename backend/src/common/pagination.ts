import { PaginationQueryDto } from './dto/pagination-query.dto';

export const DEFAULT_PAGE_SIZE = 20;

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

export function isPaginationRequested(query?: PaginationQueryDto): boolean {
  return !!query && (query.page !== undefined || query.limit !== undefined);
}

export function resolvePagination(query: PaginationQueryDto) {
  const page = query.page ?? 1;
  const limit = query.limit ?? DEFAULT_PAGE_SIZE;
  return { page, limit, skip: (page - 1) * limit, take: limit };
}

export function toPaginated<T>(data: T[], total: number, page: number, limit: number): Paginated<T> {
  return { data, meta: { total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) } };
}

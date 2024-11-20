import { User, Admin, Notification, Permission } from '@prisma/client';

export interface PaginatedResponse<T> {
  data: T[];
  metadata: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface FilterParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export type UserWithRelations = User & {
  notifications?: Notification[];
};

export type AdminWithRelations = Admin & {
  permissions?: Permission[];
  notifications?: Notification[];
};

export interface SessionUser {
  id: string;
  email: string;
  role: string;
  name?: string;
} 
import { z } from 'zod';
import { router, adminProcedure } from '../trpc';
import { handleError } from '@/lib/utils/api';
import { DEFAULT_PAGINATION } from '@/lib/constants';

export const adminRouter = router({
  getUsers: adminProcedure
    .input(z.object({
      page: z.number().default(DEFAULT_PAGINATION.PAGE),
      limit: z.number().default(DEFAULT_PAGINATION.LIMIT),
      search: z.string().optional(),
      role: z.enum(['USER', 'PREMIUM']).optional(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const skip = (input.page - 1) * input.limit;
        
        const [users, total] = await Promise.all([
          ctx.prisma.user.findMany({
            where: {
              OR: input.search ? [
                { email: { contains: input.search, mode: 'insensitive' } },
                { first_name: { contains: input.search, mode: 'insensitive' } },
                { last_name: { contains: input.search, mode: 'insensitive' } },
              ] : undefined,
              role: input.role,
              deleted_at: null,
            },
            skip,
            take: input.limit,
            orderBy: { created_at: 'desc' },
          }),
          ctx.prisma.user.count({
            where: {
              OR: input.search ? [
                { email: { contains: input.search, mode: 'insensitive' } },
                { first_name: { contains: input.search, mode: 'insensitive' } },
                { last_name: { contains: input.search, mode: 'insensitive' } },
              ] : undefined,
              role: input.role,
              deleted_at: null,
            },
          }),
        ]);

        return {
          data: users,
          metadata: {
            total,
            page: input.page,
            limit: input.limit,
            totalPages: Math.ceil(total / input.limit),
          },
        };
      } catch (error) {
        handleError(error);
      }
    }),

  getActivityLogs: adminProcedure
    .input(z.object({
      page: z.number().default(DEFAULT_PAGINATION.PAGE),
      limit: z.number().default(DEFAULT_PAGINATION.LIMIT),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const skip = (input.page - 1) * input.limit;
        
        const [logs, total] = await Promise.all([
          ctx.prisma.activityLog.findMany({
            where: { deleted_at: null },
            include: { admin: true },
            skip,
            take: input.limit,
            orderBy: { created_at: 'desc' },
          }),
          ctx.prisma.activityLog.count({
            where: { deleted_at: null },
          }),
        ]);

        return {
          data: logs,
          metadata: {
            total,
            page: input.page,
            limit: input.limit,
            totalPages: Math.ceil(total / input.limit),
          },
        };
      } catch (error) {
        handleError(error);
      }
    }),
}); 
import { z } from 'zod';
import { router, adminProcedure } from '../trpc';
import { handleError } from '@/lib/utils/api';
import { DEFAULT_PAGINATION } from '@/lib/constants';
import { UserRole, ActivityType } from '@prisma/client';
import { logAdminActivity, createSystemNotification } from '@/lib/helper-function';

export const adminRouter = router({
  getDashboardStats: adminProcedure
    .input(z.object({
      timeRange: z.enum(['day', 'week', 'month'])
    }))
    .query(async ({ input, ctx }) => {
      try {
        const [totalUsers, activeUsers, premiumUsers, recentActivity, newUsers] = await Promise.all([
          ctx.prisma.user.count(),
          ctx.prisma.user.count({ where: { is_active: true } }),
          ctx.prisma.user.count({ where: { role: UserRole.PREMIUM } }),
          ctx.prisma.activityLog.findMany({
            take: 10,
            orderBy: { created_at: 'desc' },
            include: { admin: true },
          }),
          ctx.prisma.user.count({
            where: {
              created_at: {
                gte: new Date(Date.now() - getDaysInMilliseconds(input.timeRange))
              }
            }
          })
        ]);

        await logAdminActivity(ctx.session, 'Viewed dashboard stats', ActivityType.READ);

        return {
          totalUsers,
          activeUsers,
          premiumUsers,
          newUsers,
          recentActivity
        };
      } catch (error) {
        handleError(error);
      }
    }),

  updateUserStatus: adminProcedure
    .input(z.object({
      userId: z.string(),
      isActive: z.boolean()
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const user = await ctx.prisma.user.update({
          where: { id: input.userId },
          data: { is_active: input.isActive }
        });

        await Promise.all([
          logAdminActivity(
            ctx.session, 
            `${input.isActive ? 'Activated' : 'Deactivated'} user: ${user.email}`,
            ActivityType.UPDATE
          ),
          createSystemNotification(
            `Your account has been ${input.isActive ? 'activated' : 'deactivated'}`,
            [user.id]
          )
        ]);

        return user;
      } catch (error) {
        handleError(error);
      }
    }),

  getUsers: adminProcedure
    .input(z.object({
      page: z.number().default(DEFAULT_PAGINATION.PAGE),
      limit: z.number().default(DEFAULT_PAGINATION.LIMIT),
      search: z.string().optional(),
      role: z.nativeEnum(UserRole).optional(),
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

        // Log admin activity
        await ctx.prisma.activityLog.create({
          data: {
            action: 'Viewed activity logs',
            type: ActivityType.READ,
            admin_id: ctx.session.user.id,
          },
        });

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

function getDaysInMilliseconds(timeRange: 'day' | 'week' | 'month'): number {
  switch (timeRange) {
    case 'day':
      return 24 * 60 * 60 * 1000;
    case 'week':
      return 7 * 24 * 60 * 60 * 1000;
    case 'month':
      return 30 * 24 * 60 * 60 * 1000;
  }
} 
import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { handleError } from '@/lib/utils/api';

export const userRouter = router({
  getProfile: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const user = await ctx.prisma.user.findUnique({
          where: { id: ctx.session.user.id },
          include: {
            notifications: {
              where: { deleted_at: null },
              orderBy: { created_at: 'desc' },
            },
          },
        });

        return user;
      } catch (error) {
        handleError(error);
      }
    }),

  updateProfile: protectedProcedure
    .input(z.object({
      first_name: z.string().optional(),
      last_name: z.string().optional(),
      email: z.string().email().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const user = await ctx.prisma.user.update({
          where: { id: ctx.session.user.id },
          data: input,
        });

        return user;
      } catch (error) {
        handleError(error);
      }
    }),

  getNotifications: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const notifications = await ctx.prisma.notification.findMany({
          where: {
            users: { some: { id: ctx.session.user.id } },
            deleted_at: null,
          },
          orderBy: { created_at: 'desc' },
        });

        return notifications;
      } catch (error) {
        handleError(error);
      }
    }),
}); 
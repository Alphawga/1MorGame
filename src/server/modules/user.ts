import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { handleError } from '@/lib/utils/api';
import { NotificationType } from '@prisma/client';

export const userRouter = router({
  getProfile: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const user = await ctx.prisma.user.findUnique({
          where: { id: ctx.session.user.id },
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            role: true,
            is_email_verified: true,
            is_active: true,
            created_at: true,
            notifications: {
              where: { deleted_at: null },
              orderBy: { created_at: 'desc' },
            },
          }
        });

        return user;
      } catch (error) {
        handleError(error);
      }
    }),

  updateProfile: protectedProcedure
    .input(z.object({
      first_name: z.string().min(2).optional(),
      last_name: z.string().min(2).optional(),
      email: z.string().email().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const user = await ctx.prisma.user.update({
          where: { id: ctx.session.user.id },
          data: input,
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            role: true,
          }
        });

        // Create notification for profile update
        await ctx.prisma.notification.create({
          data: {
            message: 'Profile updated successfully',
            type: NotificationType.USER,
            users: {
              connect: { id: ctx.session.user.id }
            }
          }
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
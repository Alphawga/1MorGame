import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { hashPassword } from '@/lib/utils/auth';
import { handleError } from '@/lib/utils/api';
import { UserRole, NotificationType } from '@prisma/client';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  first_name: z.string().min(2),
  last_name: z.string().min(2),
});

export const authRouter = router({
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const hashedPassword = await hashPassword(input.password);
        
        const user = await ctx.prisma.user.create({
          data: {
            ...input,
            password: hashedPassword,
            role: UserRole.USER,
            notifications: {
              create: {
                message: 'Welcome to the platform!',
                type: NotificationType.SYSTEM,
              }
            }
          },
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            role: true,
          }
        });

        return { success: true, user };
      } catch (error) {
        handleError(error);
      }
    }),

  verifyEmail: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const user = await ctx.prisma.user.update({
          where: { id: input.token },
          data: { 
            is_email_verified: true,
            notifications: {
              create: {
                message: 'Email verified successfully',
                type: NotificationType.SYSTEM,
              }
            }
          },
          select: {
            id: true,
            email: true,
            is_email_verified: true,
          }
        });

        return { success: true, user };
      } catch (error) {
        handleError(error);
      }
    }),
}); 
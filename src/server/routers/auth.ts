import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { hashPassword } from '@/lib/utils/auth';
import { baseUserSchema } from '@/lib/utils/validation';
import { handleError } from '@/lib/utils/api';

export const authRouter = router({
  register: publicProcedure
    .input(baseUserSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const hashedPassword = await hashPassword(input.password);
        
        const user = await ctx.prisma.user.create({
          data: {
            email: input.email,
            password: hashedPassword,
            first_name: input.firstName,
            last_name: input.lastName,
          },
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
          data: { is_email_verified: true },
        });

        return { success: true, user };
      } catch (error) {
        handleError(error);
      }
    }),
}); 
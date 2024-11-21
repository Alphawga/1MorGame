import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { hashPassword } from '@/lib/utils/auth';
import { handleError } from '@/lib/utils/api';
import { UserRole, NotificationType, AuthProvider } from '@prisma/client';
import { sendVerificationEmail, sendPasswordResetEmail } from '@/lib/utils/email';
import { generateVerificationToken, generateResetToken } from '@/lib/utils/auth';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).optional(),
  first_name: z.string().min(2),
  last_name: z.string().min(2),
  auth_provider: z.enum(['EMAIL', 'GOOGLE', 'FACEBOOK']).default('EMAIL'),
  social_id: z.string().optional(),
});

export const authRouter = router({
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { auth_provider, social_id, ...userData } = input;
        
        const existingUser = await ctx.prisma.user.findFirst({
          where: {
            OR: [
              { email: input.email },
              auth_provider === 'GOOGLE' ? { google_id: social_id } : undefined,
              auth_provider === 'FACEBOOK' ? { facebook_id: social_id } : undefined,
            ].filter(Boolean),
          },
        });

        if (existingUser) {
          throw new Error('User already exists');
        }

        const verificationToken = auth_provider === 'EMAIL' 
          ? generateVerificationToken() 
          : null;

        const hashedPassword = auth_provider === 'EMAIL' 
          ? await hashPassword(input.password!) 
          : null;

        const user = await ctx.prisma.user.create({
          data: {
            ...userData,
            password: hashedPassword,
            role: UserRole.USER,
            auth_provider,
            verification_token: verificationToken,
            google_id: auth_provider === 'GOOGLE' ? social_id : undefined,
            facebook_id: auth_provider === 'FACEBOOK' ? social_id : undefined,
            notifications: {
              create: {
                message: 'Welcome to 1More Game!',
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
            is_email_verified: true,
          }
        });

        if (auth_provider === 'EMAIL' && verificationToken) {
          await sendVerificationEmail(user.email, verificationToken);
        }

        return { 
          success: true, 
          user,
          message: auth_provider === 'EMAIL' 
            ? 'Please check your email to verify your account' 
            : 'Registration successful' 
        };
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

  verifySocialLogin: publicProcedure
    .input(z.object({ 
      social_id: z.string(),
      auth_provider: z.enum(['GOOGLE', 'FACEBOOK']),
      email: z.string().email(),
      first_name: z.string(),
      last_name: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const { social_id, auth_provider, ...userData } = input;
        
        const user = await ctx.prisma.user.upsert({
          where: {
            email: input.email,
          },
          update: {
            [auth_provider === 'GOOGLE' ? 'google_id' : 'facebook_id']: social_id,
            auth_provider,
            is_email_verified: true,
          },
          create: {
            ...userData,
            [auth_provider === 'GOOGLE' ? 'google_id' : 'facebook_id']: social_id,
            auth_provider,
            role: UserRole.USER,
            is_email_verified: true,
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

  requestPasswordReset: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const user = await ctx.prisma.user.findUnique({
          where: { email: input.email },
        });

        if (!user) {
          throw new Error('User not found');
        }

        const resetToken = generateResetToken();
        const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

        await ctx.prisma.user.update({
          where: { email: input.email },
          data: {
            reset_token: resetToken,
            reset_token_expires: resetTokenExpires,
          },
        });

        await sendPasswordResetEmail(user.email, resetToken);

        return { success: true, message: 'Password reset email sent' };
      } catch (error) {
        handleError(error);
      }
    }),

  resetPassword: publicProcedure
    .input(z.object({
      token: z.string(),
      newPassword: z.string().min(8),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const user = await ctx.prisma.user.findFirst({
          where: {
            reset_token: input.token,
            reset_token_expires: { gte: new Date() },
          },
        });

        if (!user) {
          throw new Error('Invalid or expired token');
        }

        const hashedPassword = await hashPassword(input.newPassword);

        await ctx.prisma.user.update({
          where: { id: user.id },
          data: {
            password: hashedPassword,
            reset_token: null,
            reset_token_expires: null,
          },
        });

        return { success: true, message: 'Password reset successful' };
      } catch (error) {
        handleError(error);
      }
    }),
}); 
import { initTRPC, TRPCError } from '@trpc/server';
import { Context } from './context';
import { UserRole, AdminRole } from '@prisma/client';

const t = initTRPC.context<Context>().create();

// Base middleware
const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      session: ctx.session,
      user: ctx.session.user,
    },
  });
});

const isAdmin = t.middleware(({ next, ctx }) => {
  if (!ctx.session?.user?.role || 
      ![AdminRole.ADMIN, AdminRole.SUPER_ADMIN].includes(ctx.session.user.role as AdminRole)) {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  return next({
    ctx: {
      session: ctx.session,
      user: ctx.session.user,
    },
  });
});

const isSuperAdmin = t.middleware(({ next, ctx }) => {
  if (!ctx.session?.user?.role || ctx.session.user.role !== AdminRole.SUPER_ADMIN) {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  return next({
    ctx: {
      session: ctx.session,
      user: ctx.session.user,
    },
  });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
export const adminProcedure = t.procedure.use(isAdmin);
export const superAdminProcedure = t.procedure.use(isSuperAdmin);
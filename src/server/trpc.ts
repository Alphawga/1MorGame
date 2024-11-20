import { initTRPC, TRPCError } from '@trpc/server';
import { Context } from './context';

const t = initTRPC.context<Context>().create();

// Base middleware
const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      session: ctx.session,
    },
  });
});

const isAdmin = t.middleware(({ next, ctx }) => {
  if (!ctx.session?.user?.role || !['ADMIN', 'SUPER_ADMIN'].includes(ctx.session.user.role)) {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  return next({
    ctx: {
      session: ctx.session,
    },
  });
});

// Reusable router creators
export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
export const adminProcedure = t.procedure.use(isAdmin);
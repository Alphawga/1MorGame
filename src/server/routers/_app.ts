import { router } from '../trpc';
import { authRouter } from './auth';
import { userRouter } from './user';
import { adminRouter } from './admin';

export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter; 
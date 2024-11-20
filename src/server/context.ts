import { inferAsyncReturnType } from '@trpc/server';
import { Session } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function createContext({ session }: { session: Session | null }) {
  return {
    session,
    prisma,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
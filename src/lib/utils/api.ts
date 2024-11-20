import { TRPCError } from '@trpc/server';

export class ApiError extends Error {
  constructor(
    message: string,
    public code: number = 400,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const handleError = (error: unknown) => {
  if (error instanceof ApiError) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: error.message,
      cause: error,
    });
  }
  
  if (error instanceof Error) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: error.message,
      cause: error,
    });
  }
  
  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
  });
}; 
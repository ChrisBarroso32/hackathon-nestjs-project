import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import type { PrismaClient } from '../../generated/prisma/client';

// Built from the injected PrismaService (see AuthModule.forRootAsync in AppModule)
// so no PrismaClient is instantiated outside Nest's DI container.
export function createAuth(prisma: PrismaClient) {
  return betterAuth({
    database: prismaAdapter(prisma, { provider: 'postgresql' }),
    emailAndPassword: { enabled: true },
    user: {
      additionalFields: {
        role: {
          type: 'string',
          required: false,
          defaultValue: 'PARTICIPANT',
          // Not accepted from clients: sign-up/update-user requests that
          // include `role` are rejected, so it can only be changed server-side.
          input: false,
        },
      },
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;

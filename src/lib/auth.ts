import { betterAuth } from "better-auth/minimal";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";

const authBaseURL = process.env.BETTER_AUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("Configura BETTER_AUTH_SECRET antes de iniciar la aplicación.");
}

export const auth = betterAuth({
  appName: "Job Tracker",
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: authBaseURL,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 12,
    maxPasswordLength: 128,
  },
  user: {
    additionalFields: {
      role: { type: "string", required: false, defaultValue: "user", input: false },
      isActive: { type: "boolean", required: false, defaultValue: true, input: false },
    },
  },
  databaseHooks: {
    user: {
      delete: {
        before: async (user) => {
          const storedUser = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } });
          return storedUser?.role !== "admin";
        },
      },
    },
    session: {
      create: {
        before: async (session) => {
          const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { isActive: true } });
          return user?.isActive ? { data: session } : false;
        },
      },
    },
  },
  rateLimit: {
    enabled: true,
    storage: "database",
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 5 },
    },
  },
  trustedOrigins: [authBaseURL],
});

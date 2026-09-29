import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getActiveSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { isActive: true, role: true } });
  if (!user?.isActive) return null;
  return { ...session, user: { ...session.user, role: user.role } };
}

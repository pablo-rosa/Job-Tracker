import { NextResponse } from "next/server";
import { getActiveSession } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";

async function adminSession() {
  const session = await getActiveSession();
  return session?.user.role === "admin" ? session : null;
}

export async function GET() {
  const session = await adminSession();
  if (!session) return NextResponse.json({ error: "No tienes permiso para gestionar usuarios." }, { status: 403 });
  try {
    const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" }, select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true, _count: { select: { applications: true } } } });
    return NextResponse.json(users.map(({ _count, ...user }) => ({ ...user, applicationCount: _count.applications })));
  } catch { return NextResponse.json({ error: "No se pudieron cargar los usuarios." }, { status: 503 }); }
}

export async function PATCH(request: Request) {
  const session = await adminSession();
  if (!session) return NextResponse.json({ error: "No tienes permiso para gestionar usuarios." }, { status: 403 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Datos no válidos." }, { status: 400 }); }
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Datos no válidos." }, { status: 400 });
  const { id, isActive } = body as Record<string, unknown>;
  if (typeof id !== "string" || typeof isActive !== "boolean") return NextResponse.json({ error: "Datos no válidos." }, { status: 400 });
  try {
    const target = await prisma.user.findUnique({ where: { id }, select: { role: true } });
    if (!target) return NextResponse.json({ error: "No se encontró ese usuario." }, { status: 404 });
    if (target.role === "admin" || target.role === "demo") return NextResponse.json({ error: "Las cuentas de sistema no se pueden suspender desde el panel." }, { status: 403 });
    await prisma.user.update({ where: { id }, data: { isActive } });
    if (!isActive) await prisma.session.deleteMany({ where: { userId: id } });
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: "No se pudo actualizar el usuario." }, { status: 503 }); }
}

export async function DELETE(request: Request) {
  const session = await adminSession();
  if (!session) return NextResponse.json({ error: "No tienes permiso para gestionar usuarios." }, { status: 403 });
  let id: unknown;
  try { id = (await request.json()).id; } catch { return NextResponse.json({ error: "Datos no válidos." }, { status: 400 }); }
  if (typeof id !== "string") return NextResponse.json({ error: "Falta el identificador del usuario." }, { status: 400 });
  try {
    const target = await prisma.user.findUnique({ where: { id }, select: { role: true } });
    if (!target) return NextResponse.json({ error: "No se encontró ese usuario." }, { status: 404 });
    if (target.role === "admin" || target.role === "demo") return NextResponse.json({ error: "Las cuentas de sistema no se pueden eliminar desde el panel." }, { status: 403 });
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: "No se pudo eliminar el usuario." }, { status: 503 }); }
}

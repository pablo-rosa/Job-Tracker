import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeApplication, statuses, type ApplicationInput } from "@/lib/application";

function parseInput(value: unknown): ApplicationInput | null {
  if (!value || typeof value !== "object") return null;
  const data = value as Record<string, unknown>;
  if (typeof data.company !== "string" || !data.company.trim()) return null;
  if (typeof data.position !== "string" || !data.position.trim()) return null;
  const status = typeof data.status === "string" && statuses.includes(data.status as ApplicationInput["status"])
    ? data.status as ApplicationInput["status"] : "SAVED";
  const optional = (key: string) => typeof data[key] === "string" && data[key].trim() ? (data[key] as string).trim() : null;
  return { company: data.company.trim(), position: data.position.trim(), url: optional("url") ?? undefined, location: optional("location") ?? undefined, salary: optional("salary") ?? undefined, status, notes: optional("notes") ?? undefined };
}

export async function GET() {
  try {
    const applications = await prisma.application.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(applications.map(serializeApplication));
  } catch {
    return NextResponse.json({ error: "No se pudieron cargar las candidaturas. Comprueba la conexión con la base de datos." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  let data: ApplicationInput | null;
  try { data = parseInput(await request.json()); } catch { data = null; }
  if (!data) return NextResponse.json({ error: "La empresa y el puesto son obligatorios." }, { status: 400 });
  try {
    const application = await prisma.application.create({ data });
    return NextResponse.json(serializeApplication(application), { status: 201 });
  } catch {
    return NextResponse.json({ error: "No se pudo guardar la candidatura. Comprueba la conexión con la base de datos." }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  let payload: unknown;
  try { payload = await request.json(); } catch { return NextResponse.json({ error: "Datos no válidos." }, { status: 400 }); }
  const body = payload as Record<string, unknown>;
  const data = parseInput(body);
  if (typeof body.id !== "string" || !body.id || !data) return NextResponse.json({ error: "La empresa y el puesto son obligatorios." }, { status: 400 });
  try {
    const application = await prisma.application.update({ where: { id: body.id }, data });
    return NextResponse.json(serializeApplication(application));
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") return NextResponse.json({ error: "No se encontró esa candidatura." }, { status: 404 });
    return NextResponse.json({ error: "No se pudo actualizar la candidatura. Comprueba la conexión con la base de datos." }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  let id: unknown;
  try { id = (await request.json()).id; } catch { return NextResponse.json({ error: "Datos no válidos." }, { status: 400 }); }
  if (typeof id !== "string" || !id) return NextResponse.json({ error: "Falta el identificador de la candidatura." }, { status: 400 });
  try {
    await prisma.application.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") return NextResponse.json({ error: "No se encontró esa candidatura." }, { status: 404 });
    return NextResponse.json({ error: "No se pudo eliminar la candidatura. Comprueba la conexión con la base de datos." }, { status: 503 });
  }
}

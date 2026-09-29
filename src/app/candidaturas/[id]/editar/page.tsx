import Link from "next/link";
import { notFound } from "next/navigation";
import { ApplicationForm } from "@/components/ApplicationForm";
import { serializeApplication } from "@/lib/application";
import { prisma } from "@/lib/prisma";
import { getActiveSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getActiveSession();
  if (!session) redirect("/login");
  if (session.user.role === "demo") redirect("/");
  let application;
  try { application = await prisma.application.findFirst({ where: { id, userId: session.user.id } }); }
  catch { return <main className="page-shell form-page"><Link href="/" className="back-link">← Volver a candidaturas</Link><div className="error-banner">No se pudo conectar con la base de datos. Comprueba DATABASE_URL y vuelve a intentarlo.</div></main>; }
  if (!application) notFound();
  return <main className="page-shell form-page"><Link href="/" className="back-link">← Volver a candidaturas</Link><div className="form-heading"><p className="eyebrow">ACTUALIZA EL SEGUIMIENTO</p><h1>Editar candidatura</h1><p className="subtitle">Modifica los detalles de {application.company}.</p></div><ApplicationForm application={serializeApplication(application)} /></main>;
}

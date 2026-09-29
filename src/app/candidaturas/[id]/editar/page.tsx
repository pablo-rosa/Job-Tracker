import Link from "next/link";
import { notFound } from "next/navigation";
import { ApplicationForm } from "@/components/ApplicationForm";
import { serializeApplication } from "@/lib/application";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let application;
  try { application = await prisma.application.findUnique({ where: { id } }); }
  catch { return <main className="page-shell form-page"><Link href="/" className="back-link">← Volver a candidaturas</Link><div className="error-banner">No se pudo conectar con la base de datos. Comprueba DATABASE_URL y vuelve a intentarlo.</div></main>; }
  if (!application) notFound();
  return <main className="page-shell form-page"><Link href="/" className="back-link">← Volver a candidaturas</Link><div className="form-heading"><p className="eyebrow">ACTUALIZA EL SEGUIMIENTO</p><h1>Editar candidatura</h1><p className="subtitle">Modifica los detalles de {application.company}.</p></div><ApplicationForm application={serializeApplication(application)} /></main>;
}

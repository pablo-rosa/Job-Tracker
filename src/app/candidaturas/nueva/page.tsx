import Link from "next/link";
import { redirect } from "next/navigation";
import { ApplicationForm } from "@/components/ApplicationForm";
import { getActiveSession } from "@/lib/auth-session";

export default async function NewApplicationPage() {
  const session = await getActiveSession();
  if (!session) redirect("/login");
  if (session.user.role === "demo") redirect("/");
  return <main className="page-shell form-page"><Link href="/" className="back-link">← Volver a candidaturas</Link><div className="form-heading"><p className="eyebrow">NUEVA OPORTUNIDAD</p><h1>Nueva candidatura</h1><p className="subtitle">Guarda los detalles de una oferta para tenerlos a mano.</p></div><ApplicationForm /></main>;
}

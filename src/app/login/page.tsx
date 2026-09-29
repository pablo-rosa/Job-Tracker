import { redirect } from "next/navigation";
import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";
import { getActiveSession } from "@/lib/auth-session";

export default async function LoginPage() {
  if (await getActiveSession()) redirect("/");
  return <main className="page-shell auth-page"><Link href="/" className="brand-link">Job Tracker</Link><div className="form-heading"><p className="eyebrow">QUÉ BUENO VERTE</p><h1>Inicia sesión</h1><p className="subtitle">Accede a tus candidaturas personales.</p></div><AuthForm mode="login" /></main>;
}

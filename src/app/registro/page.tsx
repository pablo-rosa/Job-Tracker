import { redirect } from "next/navigation";
import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";
import { getActiveSession } from "@/lib/auth-session";

export default async function RegisterPage() {
  if (await getActiveSession()) redirect("/");
  return <main className="page-shell auth-page"><Link href="/" className="brand-link">Job Tracker</Link><div className="form-heading"><p className="eyebrow">EMPIEZA A ORGANIZARTE</p><h1>Crea tu cuenta</h1><p className="subtitle">Tus candidaturas estarán disponibles solo para ti.</p></div><AuthForm mode="register" /></main>;
}

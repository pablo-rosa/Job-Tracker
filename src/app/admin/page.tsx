import { redirect } from "next/navigation";
import Link from "next/link";
import { getActiveSession } from "@/lib/auth-session";
import { UserManagement } from "@/components/UserManagement";

export default async function AdminPage() {
  const session = await getActiveSession();
  if (!session) redirect("/login");
  if (session.user.role !== "admin") redirect("/");
  return <main className="page-shell admin-page"><Link href="/" className="back-link">← Volver a candidaturas</Link><div className="form-heading"><p className="eyebrow">CUENTA ADMINISTRADORA</p><h1>Gestión de usuarios</h1><p className="subtitle">Consulta las cuentas, suspende el acceso o elimina usuarios y sus candidaturas.</p></div><UserManagement /></main>;
}

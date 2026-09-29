import { redirect } from "next/navigation";
import { Dashboard } from "@/components/Dashboard";
import { getActiveSession } from "@/lib/auth-session";

export default async function HomePage() {
  const session = await getActiveSession();
  if (!session) redirect("/login");
  return <Dashboard userName={session.user.name} isAdmin={session.user.role === "admin"} isDemo={session.user.role === "demo"} />;
}

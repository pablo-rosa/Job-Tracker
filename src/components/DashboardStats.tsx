import type { Application, ApplicationStatus } from "@prisma/client";
import { statusLabels } from "@/lib/application";

export function DashboardStats({ applications }: { applications: Pick<Application, "status">[] }) {
  const counts: { label: string; status?: ApplicationStatus; value: number }[] = [
    { label: "Total", value: applications.length },
    ...Object.entries(statusLabels).map(([status, label]) => ({ label: status === "INTERVIEW" ? "Entrevistas" : status === "OFFER" ? "Ofertas" : `${label}s`, status: status as ApplicationStatus, value: applications.filter((item) => item.status === status).length })),
  ];
  return <section className="stats" aria-label="Resumen de candidaturas">{counts.map((item) => <div className="stat" key={item.label}><span>{item.label}</span><strong>{item.value}</strong></div>)}</section>;
}

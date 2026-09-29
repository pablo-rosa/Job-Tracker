"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { ApplicationStatus } from "@prisma/client";
import { ApplicationCard } from "@/components/ApplicationCard";
import { DashboardStats } from "@/components/DashboardStats";
import { Filters } from "@/components/Filters";
import type { ApplicationRecord } from "@/lib/application";

export default function HomePage() {
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ApplicationStatus | "ALL">("ALL");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState("");
  async function loadApplications() {
    setLoading(true);
    try { const response = await fetch("/api/candidaturas"); const result = await response.json(); if (!response.ok) throw new Error(result.error); setApplications(result); setError(""); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudieron cargar las candidaturas."); }
    finally { setLoading(false); }
  }
  useEffect(() => { void loadApplications(); }, []);
  const filtered = useMemo(() => applications.filter((item) => (status === "ALL" || item.status === status) && `${item.company} ${item.position}`.toLocaleLowerCase("es").includes(query.trim().toLocaleLowerCase("es"))), [applications, query, status]);
  async function deleteApplication(id: string) {
    if (!window.confirm("¿Seguro que quieres eliminar esta candidatura? Esta acción no se puede deshacer.")) return;
    setDeleting(id); setError("");
    try { const response = await fetch("/api/candidaturas", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }); const result = await response.json(); if (!response.ok) throw new Error(result.error); setApplications((current) => current.filter((item) => item.id !== id)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudo eliminar la candidatura."); }
    finally { setDeleting(""); }
  }
  return <main className="page-shell"><header className="page-header"><div><p className="eyebrow">TU BÚSQUEDA, EN ORDEN</p><h1>Job Tracker</h1><p className="subtitle">Gestiona y realiza el seguimiento de tus candidaturas.</p></div><Link href="/candidaturas/nueva" className="button button-primary">＋ Nueva candidatura</Link></header><DashboardStats applications={applications} /><section className="list-section"><div className="list-heading"><div><h2>Tus candidaturas</h2><p>{applications.length === 1 ? "1 candidatura en total" : `${applications.length} candidaturas en total`}</p></div></div><Filters query={query} status={status} onQueryChange={setQuery} onStatusChange={setStatus} />{error && <div className="error-banner" role="alert">{error}<button onClick={() => void loadApplications()} className="button button-quiet">Reintentar</button></div>}{loading ? <p className="loading-state">Cargando candidaturas…</p> : applications.length === 0 ? <div className="empty-state"><span className="empty-icon">↗</span><h3>No tienes candidaturas todavía.</h3><p>Añade la primera para empezar a organizar tu búsqueda.</p><Link href="/candidaturas/nueva" className="button button-primary">＋ Añadir candidatura</Link></div> : filtered.length === 0 ? <div className="empty-state compact"><h3>No hay resultados</h3><p>Prueba con otra búsqueda o cambia el filtro de estado.</p></div> : <div className="application-list">{filtered.map((item) => <ApplicationCard key={item.id} application={item} onDelete={deleteApplication} deleting={deleting === item.id} />)}</div>}</section></main>;
}

import Link from "next/link";
import type { ApplicationRecord } from "@/lib/application";
import { statusLabels } from "@/lib/application";

export function ApplicationCard({ application, onDelete, deleting, readOnly = false }: { application: ApplicationRecord; onDelete: (id: string) => void; deleting: boolean; readOnly?: boolean }) {
  return <article className="application-card">
    <div className="card-top"><div><p className="company">{application.company}</p><h2>{application.position}</h2></div><span className={`badge badge-${application.status.toLowerCase()}`}>{statusLabels[application.status]}</span></div>
    <div className="card-details">{application.location && <span>⌖ {application.location}</span>}{application.salary && <span>↗ {application.salary}</span>}<span>Creada el {new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" }).format(new Date(application.createdAt))}</span></div>
    {application.notes && <p className="card-notes">{application.notes}</p>}
    <div className="card-actions">{application.url && <a className="button button-link" href={application.url} target="_blank" rel="noreferrer">Ver oferta ↗</a>}{!readOnly && <><span className="action-spacer" /><Link className="button button-quiet" href={`/candidaturas/${application.id}/editar`}>Editar</Link><button className="button button-delete" disabled={deleting} onClick={() => onDelete(application.id)}>{deleting ? "Eliminando…" : "Eliminar"}</button></>}</div>
  </article>;
}

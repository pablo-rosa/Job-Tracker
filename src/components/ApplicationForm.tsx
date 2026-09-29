"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { ApplicationRecord } from "@/lib/application";
import { statuses, statusLabels } from "@/lib/application";

export function ApplicationForm({ application }: { application?: ApplicationRecord }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setSaving(true);
    const form = new FormData(event.currentTarget);
    const data = Object.fromEntries(form.entries());
    try {
      const response = await fetch("/api/candidaturas", { method: application ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(application ? { ...data, id: application.id } : data) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "No se pudo guardar la candidatura.");
      router.push("/"); router.refresh();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudo guardar la candidatura."); setSaving(false); }
  }
  return <form className="application-form" onSubmit={handleSubmit}><div className="form-grid"><label>Empresa <span className="required">*</span><input name="company" required maxLength={120} defaultValue={application?.company ?? ""} placeholder="Ej. Acme" /></label><label>Puesto <span className="required">*</span><input name="position" required maxLength={120} defaultValue={application?.position ?? ""} placeholder="Ej. Diseñador/a de producto" /></label><label>URL de la oferta<input name="url" type="url" defaultValue={application?.url ?? ""} placeholder="https://…" /></label><label>Ubicación<input name="location" maxLength={120} defaultValue={application?.location ?? ""} placeholder="Ej. Madrid / Remoto" /></label><label>Salario<input name="salary" maxLength={80} defaultValue={application?.salary ?? ""} placeholder="Ej. 35.000–40.000 €" /></label><label>Estado<select name="status" defaultValue={application?.status ?? "SAVED"}>{statuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}</select></label><label className="full-width">Notas<textarea name="notes" rows={5} maxLength={3000} defaultValue={application?.notes ?? ""} placeholder="Añade cualquier detalle que quieras recordar…" /></label></div>{error && <p className="error-message" role="alert">{error}</p>}<div className="form-actions"><button type="button" className="button button-quiet" onClick={() => router.push("/")}>Cancelar</button><button className="button button-primary" disabled={saving}>{saving ? "Guardando…" : application ? "Guardar cambios" : "Guardar candidatura"}</button></div></form>;
}

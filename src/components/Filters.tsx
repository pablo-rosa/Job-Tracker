import type { ApplicationStatus } from "@prisma/client";
import { statuses, statusLabels } from "@/lib/application";

export function Filters({ query, status, onQueryChange, onStatusChange }: { query: string; status: ApplicationStatus | "ALL"; onQueryChange: (value: string) => void; onStatusChange: (value: ApplicationStatus | "ALL") => void }) {
  return <div className="filters"><label className="search-field"><span className="sr-only">Buscar por empresa o puesto</span><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Buscar empresa o puesto" /></label><label className="select-field"><span className="sr-only">Filtrar por estado</span><select value={status} onChange={(event) => onStatusChange(event.target.value as ApplicationStatus | "ALL")}><option value="ALL">Todos los estados</option>{statuses.map((item) => <option key={item} value={item}>{statusLabels[item]}</option>)}</select></label></div>;
}

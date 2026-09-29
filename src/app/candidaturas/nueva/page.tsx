import Link from "next/link";
import { ApplicationForm } from "@/components/ApplicationForm";

export default function NewApplicationPage() {
  return <main className="page-shell form-page"><Link href="/" className="back-link">← Volver a candidaturas</Link><div className="form-heading"><p className="eyebrow">NUEVA OPORTUNIDAD</p><h1>Nueva candidatura</h1><p className="subtitle">Guarda los detalles de una oferta para tenerlos a mano.</p></div><ApplicationForm /></main>;
}

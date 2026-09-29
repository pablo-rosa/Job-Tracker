import Link from "next/link";

export default function NotFound() {
  return <main className="page-shell form-page"><div className="empty-state"><h1>No encontramos esa candidatura</h1><p>Puede que se haya eliminado o que el enlace no sea válido.</p><Link href="/" className="button button-primary">Volver al inicio</Link></div></main>;
}

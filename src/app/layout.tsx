import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Job Tracker", description: "Gestiona y realiza el seguimiento de tus candidaturas." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}

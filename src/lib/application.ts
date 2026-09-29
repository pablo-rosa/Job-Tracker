import type { Application, ApplicationStatus } from "@/generated/prisma";

export const statuses: ApplicationStatus[] = ["SAVED", "APPLIED", "INTERVIEW", "OFFER", "REJECTED"];

export const statusLabels: Record<ApplicationStatus, string> = {
  SAVED: "Guardada",
  APPLIED: "Enviada",
  INTERVIEW: "Entrevista",
  OFFER: "Oferta",
  REJECTED: "Rechazada",
};

export type ApplicationInput = {
  company: string;
  position: string;
  url?: string;
  location?: string;
  salary?: string;
  status: ApplicationStatus;
  notes?: string;
};

export type ApplicationRecord = Omit<Application, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

export function serializeApplication(application: Application): ApplicationRecord {
  return { ...application, createdAt: application.createdAt.toISOString(), updatedAt: application.updatedAt.toISOString() };
}

"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [demoSaving, setDemoSaving] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setSaving(true);
    const data = new FormData(event.currentTarget);
    try {
      const result = mode === "login"
        ? await authClient.signIn.email({ email: String(data.get("email")), password: String(data.get("password")) })
        : await authClient.signUp.email({ name: String(data.get("name")), email: String(data.get("email")), password: String(data.get("password")) });
      if (result.error) throw new Error(mode === "login" ? "El correo o la contraseña no son correctos." : "No se pudo crear la cuenta. Puede que el correo ya esté registrado.");
      router.replace("/"); router.refresh();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudo completar la operación."); setSaving(false); }
  }
  async function enterDemo() {
    setError(""); setDemoSaving(true);
    try {
      const response = await fetch("/api/demo/enter", { method: "POST" });
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error || "No se pudo abrir la cuenta de demostración. Inténtalo de nuevo.");
      }
      router.replace("/"); router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo abrir la cuenta de demostración.");
      setDemoSaving(false);
    }
  }
  return <form className="application-form auth-form" onSubmit={submit}><div className="form-grid">{mode === "register" && <label className="full-width">Nombre<input name="name" required maxLength={80} autoComplete="name" /></label>}<label className="full-width">Correo electrónico<input type="email" name="email" required maxLength={254} autoComplete="email" /></label><label className="full-width">Contraseña<input type="password" name="password" required minLength={12} maxLength={128} autoComplete={mode === "login" ? "current-password" : "new-password"} />{mode === "register" && <small>Usa al menos 12 caracteres.</small>}</label></div>{error && <p className="error-message" role="alert">{error}</p>}<div className="form-actions"><button className="button button-primary auth-submit" disabled={saving || demoSaving}>{saving ? "Un momento…" : mode === "login" ? "Iniciar sesión" : "Crear cuenta"}</button></div>{mode === "login" && <><div className="auth-divider"><span>o bien</span></div><button type="button" className="button button-demo auth-submit" disabled={saving || demoSaving} onClick={() => void enterDemo()}>{demoSaving ? "Preparando demo…" : "Probar como reclutador"}</button><p className="demo-caption">Acceso a datos ficticios, sin registro y en modo de solo lectura.</p></>}<p className="auth-switch">{mode === "login" ? <>¿Aún no tienes cuenta? <Link href="/registro">Regístrate</Link></> : <>¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link></>}</p></form>;
}

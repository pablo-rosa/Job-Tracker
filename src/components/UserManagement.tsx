"use client";

import { useEffect, useState } from "react";

type UserItem = { id: string; name: string; email: string; role: string; isActive: boolean; createdAt: string; applicationCount: number };

export function UserManagement() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState("");
  async function load() {
    setLoading(true);
    try { const response = await fetch("/api/admin/users"); const data = await response.json(); if (!response.ok) throw new Error(data.error); setUsers(data); setError(""); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudieron cargar los usuarios."); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);
  async function updateUser(user: UserItem) {
    if (user.isActive && !window.confirm(`¿Quieres suspender la cuenta de ${user.name}? Se cerrarán sus sesiones activas.`)) return;
    setWorking(user.id); setError("");
    try { const response = await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: user.id, isActive: !user.isActive }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error); setUsers((items) => items.map((item) => item.id === user.id ? { ...item, isActive: !item.isActive } : item)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudo actualizar el usuario."); }
    finally { setWorking(""); }
  }
  async function deleteUser(user: UserItem) {
    if (!window.confirm(`¿Eliminar a ${user.name} (${user.email}) y todas sus candidaturas? Esta acción no se puede deshacer.`)) return;
    setWorking(user.id); setError("");
    try { const response = await fetch("/api/admin/users", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: user.id }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error); setUsers((items) => items.filter((item) => item.id !== user.id)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudo eliminar el usuario."); }
    finally { setWorking(""); }
  }
  if (loading) return <p className="loading-state">Cargando usuarios…</p>;
  return <section className="user-management">{error && <div className="error-banner" role="alert">{error}<button className="button button-quiet" onClick={() => void load()}>Reintentar</button></div>}{users.length === 0 ? <div className="empty-state compact"><h3>No hay usuarios registrados.</h3></div> : <div className="user-list">{users.map((user) => { const protectedAccount = user.role === "admin" || user.role === "demo"; return <article key={user.id} className="user-card"><div className="user-info"><div className="user-avatar">{user.name.slice(0, 1).toLocaleUpperCase("es")}</div><div><h2>{user.name} {user.role === "admin" && <span className="badge badge-offer">Administrador</span>}{user.role === "demo" && <span className="badge badge-applied">Demo</span>}</h2><p>{user.email}</p><small>{user.applicationCount} candidaturas · {user.isActive ? "Activa" : "Suspendida"}</small></div></div>{protectedAccount ? <span className="protected-note">Cuenta protegida</span> : <div className="user-actions"><button className="button button-quiet" disabled={working === user.id} onClick={() => void updateUser(user)}>{user.isActive ? "Suspender" : "Reactivar"}</button><button className="button button-delete" disabled={working === user.id} onClick={() => void deleteUser(user)}>{working === user.id ? "Procesando…" : "Eliminar"}</button></div>}</article>; })}</div>}</section>;
}

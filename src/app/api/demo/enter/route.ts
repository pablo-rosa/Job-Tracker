import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  const email = process.env.DEMO_EMAIL;
  const password = process.env.DEMO_PASSWORD;
  if (!email || !password) return NextResponse.json({ error: "La cuenta de demostración aún no está configurada." }, { status: 503 });

  const origin = request.headers.get("origin");
  if (origin !== new URL(request.url).origin || request.headers.get("sec-fetch-site") === "cross-site") {
    return NextResponse.json({ error: "No se pudo validar la solicitud." }, { status: 403 });
  }

  const headers = new Headers({ "content-type": "application/json", origin });
  for (const name of ["x-forwarded-for", "x-real-ip", "cf-connecting-ip", "user-agent", "sec-fetch-site"]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  const authRequest = new Request(new URL("/api/auth/sign-in/email", request.url), {
    method: "POST",
    headers,
    body: JSON.stringify({ email, password, rememberMe: true }),
  });
  return auth.handler(authRequest);
}

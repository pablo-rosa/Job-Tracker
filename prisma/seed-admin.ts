import "dotenv/config";
import { auth } from "../src/lib/auth";
import { prisma } from "../src/lib/prisma";

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || "Administrador";
  if (!email || !password || password.length < 12) throw new Error("Define ADMIN_EMAIL y una ADMIN_PASSWORD de al menos 12 caracteres en .env.");

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && existing.role !== "admin") throw new Error("Ese correo ya pertenece a una cuenta normal; el administrador no se ha cambiado.");
  let admin = existing;
  if (!admin) {
    const result = await auth.api.signUpEmail({ body: { name, email, password } });
    if (!result?.user?.id || result.user.email.toLowerCase() !== email) throw new Error("No se pudo crear la cuenta administradora; no se ha elevado ninguna cuenta existente.");
    admin = await prisma.user.update({ where: { id: result.user.id }, data: { role: "admin" } });
  }
  await prisma.application.updateMany({ where: { userId: null }, data: { userId: admin.id } });
  console.log(`Cuenta administradora lista para ${email}.`);
}

seedAdmin().catch((error: unknown) => { console.error(error instanceof Error ? error.message : "No se pudo preparar la cuenta administradora."); process.exitCode = 1; }).finally(async () => { await prisma.$disconnect(); });

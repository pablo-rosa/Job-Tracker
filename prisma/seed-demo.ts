import "dotenv/config";
import { auth } from "../src/lib/auth";
import { prisma } from "../src/lib/prisma";

async function seedDemo() {
  const email = process.env.DEMO_EMAIL?.trim().toLowerCase();
  const password = process.env.DEMO_PASSWORD;
  if (!email || !password || password.length < 12) throw new Error("Define DEMO_EMAIL y una DEMO_PASSWORD de al menos 12 caracteres en .env.");

  let demo = await prisma.user.findUnique({ where: { email } });
  if (demo && demo.role !== "demo") throw new Error("Ese correo ya pertenece a una cuenta que no es la cuenta demo.");
  if (!demo) {
    const result = await auth.api.signUpEmail({ body: { name: "Cuenta de demostración", email, password } });
    if (!result?.user?.id || result.user.email.toLowerCase() !== email) throw new Error("No se pudo crear la cuenta de demostración.");
    demo = await prisma.user.update({ where: { id: result.user.id }, data: { role: "demo", isActive: true } });
  } else if (!demo.isActive) {
    demo = await prisma.user.update({ where: { id: demo.id }, data: { isActive: true } });
  }

  const applicationCount = await prisma.application.count({ where: { userId: demo.id } });
  if (applicationCount === 0) {
    await prisma.application.createMany({ data: [
      { userId: demo.id, company: "Lumen Studio", position: "Product Designer", url: "https://careers.example.com/lumen-product-designer", location: "Madrid · Híbrido", salary: "38.000–44.000 €", status: "INTERVIEW", notes: "Primera entrevista con el equipo de diseño." },
      { userId: demo.id, company: "Northstar Labs", position: "Frontend Developer", url: "https://careers.example.com/northstar-frontend", location: "Remoto · España", salary: "42.000–50.000 €", status: "APPLIED", notes: "Solicitud enviada esta semana." },
      { userId: demo.id, company: "Verde Circular", position: "UX Researcher", location: "Valencia", salary: "34.000–39.000 €", status: "SAVED", notes: "Revisar el equipo y preparar ejemplos de investigación." },
      { userId: demo.id, company: "Atlas & Co.", position: "Product Manager", location: "Barcelona · Híbrido", salary: "45.000–54.000 €", status: "OFFER", notes: "Oferta recibida. Responder antes del viernes." },
      { userId: demo.id, company: "Cobalto Health", position: "Visual Designer", location: "Remoto", status: "REJECTED", notes: "Agradecieron la conversación y eligieron otro perfil." },
    ] });
  }
  console.log(`Cuenta de demostración y candidaturas de ejemplo listas para ${email}.`);
}

seedDemo().catch((error: unknown) => { console.error(error instanceof Error ? error.message : "No se pudo preparar la cuenta de demostración."); process.exitCode = 1; }).finally(async () => { await prisma.$disconnect(); });

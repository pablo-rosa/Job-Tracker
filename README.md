# Job Tracker

Aplicación web para organizar candidaturas de trabajo, consultar su estado y mantener a mano los detalles de cada oferta. La interfaz y los mensajes están en español.

## Tecnologías y estructura

- **Next.js App Router** organiza las páginas y la ruta de API.
- **React y TypeScript** implementan la interfaz y su lógica.
- **PostgreSQL** almacena las candidaturas.
- **Prisma** define el esquema y realiza las consultas a la base de datos.
- **CSS** proporciona los estilos responsive.

```text
prisma/
  schema.prisma           Modelo y enum de estados
  migrations/             Migraciones versionadas de la base de datos
src/
  app/
    api/auth/[...all]/    Endpoints de registro, login y sesión
    api/admin/users/      Gestión administrativa de cuentas
    api/demo/enter/       Acceso público a la cuenta demo
    api/candidaturas/     API para listar y modificar candidaturas
    login/                Inicio de sesión
    registro/             Registro de usuarios
    admin/                Panel de administración
    candidaturas/nueva/   Formulario de creación
    candidaturas/[id]/editar/  Formulario de edición
    page.tsx              Panel principal
    layout.tsx            Layout y metadatos globales
    globals.css           Estilos globales y responsive
  components/             Tarjeta, formulario, filtros y estadísticas
  lib/
    application.ts        Estados, etiquetas y tipos compartidos
    auth.ts               Better Auth, cookies y límites de intentos
    auth-session.ts       Lectura de sesión y estado de la cuenta
    prisma.ts             Cliente Prisma reutilizable
prisma/seed-admin.ts      Inicialización segura del administrador
prisma/seed-demo.ts       Cuenta demo y datos ficticios
```

## Cómo funciona

### Datos

El modelo `Application` está definido en `prisma/schema.prisma`. Guarda empresa y puesto (obligatorios), URL, ubicación, salario, notas, estado y fechas de creación y actualización. Los campos opcionales se guardan como `NULL` cuando están vacíos. El enum `ApplicationStatus` limita el estado a `SAVED`, `APPLIED`, `INTERVIEW`, `OFFER` o `REJECTED`; la interfaz muestra sus etiquetas en español.

`src/lib/prisma.ts` crea el cliente Prisma compartido durante el desarrollo para evitar abrir conexiones adicionales con cada recarga. Las migraciones de `prisma/migrations/` registran los cambios del esquema y deben conservarse en el control de versiones.

Los modelos `User`, `Session`, `Account` y `Verification` de Prisma almacenan las cuentas y sesiones. Las contraseñas no se guardan en claro: Better Auth las convierte a hashes scrypt. Cada candidatura tiene una referencia a su propietario; el servidor añade el ID de la sesión al crear y limita listar, editar y eliminar a ese propietario. Las candidaturas que existían antes de añadir cuentas se asignan al administrador cuando se ejecuta `npm run seed:admin`.

### Registro, sesión y seguridad

- **`/registro`** crea una cuenta con nombre, correo y contraseña de al menos 12 caracteres. **`/login`** inicia sesión y la página principal solo es accesible con una sesión activa.
- Las sesiones son persistentes en PostgreSQL. Las cookies de autenticación son gestionadas por Better Auth; en producción usa atributos `HttpOnly`, `SameSite` y `Secure` sobre HTTPS. El límite de intentos también se guarda en PostgreSQL y aplica un máximo más bajo a registro e inicio de sesión.
- Las rutas API verifican la sesión en servidor. El ID del propietario se obtiene de esa sesión, nunca del cuerpo enviado por el navegador. Los endpoints usan Prisma con consultas parametrizadas y comprueban propiedad antes de editar o eliminar.
- Las respuestas añaden cabeceras HTTP contra sniffing de contenido, framing y solicitudes inseguras de orígenes no confiables. En producción sirve la aplicación exclusivamente mediante HTTPS y configura `BETTER_AUTH_URL` con su URL `https://` pública para activar cookies seguras y el origen confiable.
- No se verifica el correo ni se envían correos de recuperación de contraseña. Si un usuario pierde su contraseña, el administrador puede eliminar su cuenta para que se registre otra vez.

### Administrador y gestión de cuentas

El panel **`/admin`** solo está disponible para el usuario cuyo rol de base de datos sea `admin`. Permite ver cuentas y el número de candidaturas, suspender/reactivar usuarios y eliminar usuarios y sus candidaturas. Suspender una cuenta desactiva nuevas sesiones y revoca las existentes. La cuenta administradora no se puede suspender ni eliminar desde la interfaz ni desde los endpoints de la aplicación; también está protegida por un hook de base de datos de Better Auth.

La cuenta administradora inicial se crea con el script `prisma/seed-admin.ts`; no hay una contraseña inicial dentro del código. Configura `ADMIN_EMAIL` y `ADMIN_PASSWORD` en `.env` antes de ejecutar el script. La contraseña del administrador debe tener al menos 12 caracteres. El script no eleva a administrador un correo que ya pertenezca a una cuenta normal. Ejecútalo antes de abrir el registro público por primera vez.

### Acceso para reclutadores

La página `/login` incluye **Probar como reclutador**. El botón inicia una sesión del usuario con rol `demo` mediante el endpoint servidor `/api/demo/enter`; la contraseña demo nunca se envía al navegador. El script `npm run seed:demo` crea esa cuenta y cinco candidaturas completamente ficticias en PostgreSQL. Configura `DEMO_EMAIL` y `DEMO_PASSWORD` en el entorno antes de ejecutarlo. La API bloquea todas las escrituras para ese rol, y la interfaz oculta las acciones de edición y borrado. La cuenta demo está protegida en PostgreSQL contra eliminación o suspensión; para un restablecimiento futuro, modifica el script de siembra y aplica una migración controlada.

### Páginas e interacción

- **`/`** carga las candidaturas desde la API y presenta el resumen por estado y la lista ordenada de la más reciente a la más antigua. La búsqueda compara empresa y puesto; el selector filtra por estado. Se pueden combinar ambos filtros. La lista muestra una tarjeta por candidatura, un enlace externo a la oferta cuando hay URL y las acciones Editar y Eliminar. Eliminar pide confirmación y, si tiene éxito, retira la tarjeta de la lista.
- **`/candidaturas/nueva`** presenta el formulario de alta. Empresa y puesto son obligatorios; los campos restantes son opcionales. Al guardar, vuelve al panel principal.
- **`/candidaturas/[id]/editar`** carga la candidatura desde Prisma y precarga el formulario. Si el identificador no existe, muestra la página de no encontrado; si falla la conexión, presenta un mensaje comprensible.
- **Estados vacíos y errores:** el panel diferencia entre carga, lista vacía y búsqueda sin resultados. Los errores de conexión y de operaciones se muestran en la interfaz para que se puedan corregir o reintentar.

### API y persistencia

La ruta `src/app/api/candidaturas/route.ts` concentra las operaciones de base de datos. Todas las consultas pasan por Prisma:

| Método | Ruta | Operación |
| --- | --- | --- |
| `GET` | `/api/candidaturas` | Lista las candidaturas por fecha descendente. |
| `POST` | `/api/candidaturas` | Crea una candidatura tras validar empresa y puesto. |
| `PUT` | `/api/candidaturas` | Actualiza una candidatura identificada por `id`. |
| `DELETE` | `/api/candidaturas` | Elimina una candidatura identificada por `id`. |
| `GET` | `/api/admin/users` | Lista usuarios; requiere rol de administrador. |
| `PATCH` | `/api/admin/users` | Suspende o reactiva un usuario; requiere rol de administrador. |
| `DELETE` | `/api/admin/users` | Elimina un usuario normal y sus candidaturas; requiere rol de administrador. |
| `POST` | `/api/demo/enter` | Inicia sesión en la cuenta demo sin exponer su contraseña al navegador. |
| `GET`, `POST` | `/api/auth/[...all]` | Endpoints de Better Auth para registro, inicio y cierre de sesión. |

Las respuestas incluyen mensajes sencillos para datos inválidos, identificadores inexistentes y errores de base de datos. Las fechas se convierten a texto ISO antes de enviarse al navegador.

## Instalación y configuración

## Requisitos

- Node.js 20 o posterior y npm
- Una instancia de PostgreSQL accesible

## Instalación

```bash
npm install
```

### Configurar PostgreSQL

Crea una base de datos en PostgreSQL. Copia `.env.example` como `.env` en la raíz del proyecto y configura estas variables:

```env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/job_tracker?schema=public"
BETTER_AUTH_SECRET=""
BETTER_AUTH_URL=""
ADMIN_NAME="Administrador"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="una-frase-secreta-de-al-menos-12-caracteres"
DEMO_EMAIL="recruiter-demo@example.com"
DEMO_PASSWORD=""
```

Genera un secreto aleatorio de al menos 32 caracteres para `BETTER_AUTH_SECRET` (por ejemplo, con `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"`) y una contraseña aleatoria de al menos 12 caracteres para `DEMO_PASSWORD`. En local, `BETTER_AUTH_URL` puede quedar vacío y la aplicación usará `http://localhost:3000`. No guardes el `.env` ni credenciales reales en el repositorio.

### Preparar Prisma y la base de datos

```bash
npx prisma generate
npx prisma migrate dev
npm run seed:admin
npm run seed:demo
```

`seed:admin` solo es necesario si todavía no existe la cuenta administradora. `seed:demo` crea o comprueba la cuenta de demostración y los datos de muestra; ambos scripts son repetibles.

En una base de datos desplegada, aplica migraciones ya creadas con `npx prisma migrate deploy`. Para desarrollo local, `npx prisma migrate dev` puede crear y aplicar una nueva migración.

### Iniciar el proyecto

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en el navegador. Para compilar la aplicación para producción, ejecuta `npm run build`.

## Despliegue en Vercel

El proyecto usa Next.js App Router. `npm install` genera Prisma Client mediante `postinstall`, y `npm run build` ejecuta `next build`. Vercel detecta Next.js automáticamente, así que no hace falta `vercel.json` ni una función personalizada. El proyecto está preparado para ejecutarse como funciones Node.js de Next.js; conserva la base de datos y las sesiones en Neon, nunca en el almacenamiento local efímero de una función.

1. Importa el repositorio en Vercel con el directorio raíz del proyecto. Mantén los comandos de instalación y build por defecto (`npm install` y `npm run build`).
2. Añade en los entornos de Vercel las variables `DATABASE_URL`, `BETTER_AUTH_SECRET`, `DEMO_EMAIL` y `DEMO_PASSWORD`. Usa el mismo correo y contraseña demo con los que se ejecutó `seed:demo`; el correo puede ser público, la contraseña debe ser aleatoria y quedarse solo en variables del servidor. Configura una rama/base de datos Neon distinta para **Preview** y no conectes despliegues de prueba a datos reales de **Production**.
3. En **Production**, define `BETTER_AUTH_URL` como el origen HTTPS canónico de la aplicación, por ejemplo `https://tu-dominio.com`. En **Preview**, se puede dejar sin valor: la aplicación usa la URL `VERCEL_URL` de ese despliegue. Establece un `BETTER_AUTH_SECRET` estable y privado para cada entorno y conserva el mismo valor entre sus despliegues.
4. Antes del primer despliegue con un esquema nuevo, ejecuta `npm run db:migrate:deploy` usando `DATABASE_URL` del entorno objetivo. Ejecuta también `npm run seed:demo` para una base de datos nueva y `npm run seed:admin` si ese entorno necesita cuenta administradora. Estos pasos se ejecutan explícitamente contra la base de datos de destino; no se mezclan con el build de previews.

Vercel aplica las variables solo a nuevos despliegues, así que crea un nuevo despliegue después de cambiarlas. No declares secretos con prefijo `NEXT_PUBLIC_`: las variables de ese tipo se incluyen en el JavaScript que recibe el navegador. Consulta la [guía de despliegue de Next.js en Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs) y la [documentación de variables de entorno de Vercel](https://vercel.com/docs/environment-variables).

## Mantenimiento

Cuando cambie `prisma/schema.prisma`, crea y aplica una migración en desarrollo, y regenera el cliente:

```bash
npx prisma migrate dev --name descripcion-del-cambio
npx prisma generate
```

Incluye los nuevos archivos de `prisma/migrations/` en el commit. No incluyas `.env` ni credenciales en el repositorio. `npm run typecheck` comprueba los tipos de TypeScript y `npm run build` genera la compilación de producción.

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
    api/candidaturas/     API para listar y modificar candidaturas
    candidaturas/nueva/   Formulario de creación
    candidaturas/[id]/editar/  Formulario de edición
    page.tsx              Panel principal
    layout.tsx            Layout y metadatos globales
    globals.css           Estilos globales y responsive
  components/             Tarjeta, formulario, filtros y estadísticas
  lib/
    application.ts        Estados, etiquetas y tipos compartidos
    prisma.ts             Cliente Prisma reutilizable
```

## Cómo funciona

### Datos

El modelo `Application` está definido en `prisma/schema.prisma`. Guarda empresa y puesto (obligatorios), URL, ubicación, salario, notas, estado y fechas de creación y actualización. Los campos opcionales se guardan como `NULL` cuando están vacíos. El enum `ApplicationStatus` limita el estado a `SAVED`, `APPLIED`, `INTERVIEW`, `OFFER` o `REJECTED`; la interfaz muestra sus etiquetas en español.

`src/lib/prisma.ts` crea el cliente Prisma compartido durante el desarrollo para evitar abrir conexiones adicionales con cada recarga. Las migraciones de `prisma/migrations/` registran los cambios del esquema y deben conservarse en el control de versiones.

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

Crea una base de datos vacía en PostgreSQL. Copia `.env.example` como `.env` en la raíz del proyecto y configura `DATABASE_URL` con la URL de conexión de tu base de datos. Por ejemplo:

```env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/job_tracker?schema=public"
```

Usa tus propios datos de conexión; no guardes credenciales reales en el repositorio.

### Preparar Prisma y la base de datos

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### Iniciar el proyecto

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en el navegador. Para compilar la aplicación para producción, ejecuta `npm run build`.

## Mantenimiento

Cuando cambie `prisma/schema.prisma`, crea y aplica una migración en desarrollo, y regenera el cliente:

```bash
npx prisma migrate dev --name descripcion-del-cambio
npx prisma generate
```

Incluye los nuevos archivos de `prisma/migrations/` en el commit. No incluyas `.env` ni credenciales en el repositorio. `npm run typecheck` comprueba los tipos de TypeScript y `npm run build` genera la compilación de producción.

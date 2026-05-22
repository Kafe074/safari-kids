# 🦁 Safari Kids — Sistema de Gestión de Peluquería Infantil

Sistema web completo para una peluquería infantil temática. Incluye portal público, panel de cliente, panel de empleado y panel de administrador con pago simulado, boletas, promociones y descuentos.

---

## 🛠️ Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 · Vite · TanStack Query · React Router v6 · react-icons |
| Backend | Spring Boot 3.4.1 · Spring Security · JWT |
| Base de datos (local) | MySQL 8.4 |
| Base de datos (producción) | PostgreSQL 16 (Railway) |
| ORM | Spring Data JPA · Hibernate 6 |
| Estilos | CSS custom (sistema chunky design propio) |
| Deploy backend | Railway (NIXPACKS) |
| Deploy frontend | Vercel |

---

## 🌐 URLs de producción

| Servicio | URL |
|----------|-----|
| Frontend | `https://safarikids.vercel.app` |
| Backend API | `https://safari-kids.up.railway.app` |

---

## ⚙️ Requisitos previos (desarrollo local)

- Java 17 LTS
- Maven 3.9+
- Node.js 18+ y npm
- MySQL 8.x

---

## 💻 Desarrollo local

### 1. Base de datos MySQL

Crear la base de datos y el usuario en MySQL:

```sql
CREATE DATABASE IF NOT EXISTS Safari_kids CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'safari'@'%' IDENTIFIED BY '1234';
GRANT ALL PRIVILEGES ON `Safari_kids`.* TO 'safari'@'%';
FLUSH PRIVILEGES;
```

> Spring Boot crea las tablas automáticamente al primer arranque (`ddl-auto=update`) e inserta datos de prueba vía `DataInitializer`.

### 2. Backend (perfil local → MySQL)

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

Inicia en `http://localhost:8080`.

> **IntelliJ IDEA:** Edit Configurations → Environment → VM Options: `-Dspring.profiles.active=local`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Inicia en `http://localhost:5173`. El proxy de Vite reenvía `/api` → `localhost:8080` automáticamente.

---

## 🚀 Despliegue en producción

El proyecto usa **Railway** para el backend y **Vercel** para el frontend. No se requieren cambios en el código — el sistema detecta el entorno por variables de entorno.

---

### Backend → Railway

#### Paso 1: Crear proyecto en Railway

1. Ir a [railway.app](https://railway.app) e iniciar sesión
2. **New Project → Deploy from GitHub repo** → seleccionar este repositorio
3. Railway detectará el `railway.toml` y construirá automáticamente con NIXPACKS

#### Paso 2: Agregar PostgreSQL

En el proyecto de Railway:
1. **+ New → Database → Add PostgreSQL**
2. Railway crea la BD y genera las variables de conexión automáticamente

#### Paso 3: Configurar variables de entorno del backend

En el servicio del backend (no en la BD), ir a **Variables** y agregar:

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `SPRING_DATASOURCE_URL` | `${{Postgres.DATABASE_URL}}` | Se llena automático desde el plugin de PostgreSQL |
| `SPRING_DATASOURCE_USERNAME` | `${{Postgres.POSTGRES_USER}}` | Idem |
| `SPRING_DATASOURCE_PASSWORD` | `${{Postgres.POSTGRES_PASSWORD}}` | Idem |
| `JWT_SECRET` | `UnSecretoLargoYSeguro123!@#$%` | Mínimo 32 caracteres |
| `CORS_ALLOWED_ORIGINS` | `https://tu-app.vercel.app` | URL exacta del frontend en Vercel |

> Railway vincula las variables del plugin PostgreSQL con la sintaxis `${{Postgres.VARIABLE}}`. Si los nombres difieren, copia los valores manualmente desde la pestaña **Variables** de la BD.

#### Paso 4: Verificar el deploy

El `railway.toml` ya tiene la configuración correcta:

```toml
[build]
builder = "NIXPACKS"
buildCommand = "mvn clean package -DskipTests"

[deploy]
startCommand = "java -jar target/safari-kids-backend-1.0.0.jar"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3
```

Al hacer push a `main`, Railway compilará y desplegará automáticamente. Las tablas se crean solas en el primer arranque.

---

### Frontend → Vercel

#### Paso 1: Importar el proyecto

1. Ir a [vercel.com](https://vercel.com) e iniciar sesión
2. **Add New Project → Import Git Repository** → seleccionar este repositorio
3. Configurar:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

#### Paso 2: Actualizar la URL del backend en vercel.json

Editar `frontend/vercel.json` con la URL generada por Railway:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://TU-PROYECTO.up.railway.app/api/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

> La URL del backend la encuentras en Railway → tu servicio → pestaña **Settings → Networking → Public Domain**.

#### Paso 3: Deploy

Hacer push o click en **Deploy**. Vercel detecta el `vercel.json` y configura el rewrite automáticamente — no hace falta ninguna variable de entorno en el frontend.

---

## 🔄 Flujo completo de despliegue (resumen)

```
git push origin main
        │
        ├─► Railway detecta cambio → mvn clean package → java -jar
        │   └─► Conecta a PostgreSQL via SPRING_DATASOURCE_URL
        │
        └─► Vercel detecta cambio → npm run build → deploy dist/
            └─► vercel.json reescribe /api/* → Railway backend
```

---

## 👤 Usuarios de prueba (seed)

| Rol | Correo | Contraseña |
|-----|--------|------------|
| Administrador | admin@safarikids.com | admin123 |
| Empleado | carlos@safarikids.com | emp123 |
| Empleado | lucia@safarikids.com | emp123 |
| Cliente | sofia@gmail.com | cli123 |
| Cliente | pedro@gmail.com | cli123 |

---

## 🗂️ Módulos del sistema

### Portal público
- Landing page con hero animado, servicios, galería y sedes
- Catálogo de servicios (`/servicios`)
- Tienda de productos (`/tienda`)

### Panel cliente
- Mi cuenta con accesos rápidos (`/mi-cuenta`)
- Nueva reserva — 4 pasos: servicio → fecha/sede → confirmación → **pago con código de descuento y boleta** (`/reservar`)
- Historial de reservas con cancelación (`/mi-cuenta/reservas`)
- Historial de compras (`/mi-cuenta/compras`)
- Carrito y pago simulado con tarjeta (`/carrito`)
- Registro con dirección y fecha de nacimiento (`/registro`)

### Panel empleado
- Agenda del día con clientes (`/empleado`)
- Gestión de citas asignadas (`/mis-citas`)

### Panel administrador
- Dashboard con estadísticas en tiempo real (`/dashboard`)
- Reservas con nombre de cliente, local y observaciones (`/reservas`)
- Clientes, empleados (con nombre completo y local asignado) (`/clientes`, `/empleados`)
- Servicios, productos, inventario, ventas, compras (`/servicios-admin`, etc.)
- **Promociones y descuentos** — Global, Por código, Primer servicio (`/promociones`)
- Reportes y estadísticas (`/reportes`)
- Usuarios y roles (`/usuarios`)
- **Configuración** con 6 módulos funcionales (`/admin`):
  - Gestión de horarios (`/admin/horarios`)
  - Gestión de sillas (`/admin/asientos`)
  - Promociones y descuentos (`/admin/promociones` → `/promociones`)
  - Insumos del salón con alerta de stock bajo (`/admin/insumos`)
  - Notificaciones con toggles email/SMS (`/admin/notificaciones`)
  - Seguridad — cambio de contraseña y estado del sistema (`/admin/seguridad`)

---

## 💳 Sistema de pagos y descuentos

El flujo de pago está integrado en la reserva (paso 4):

1. **Descuento global automático:** si existe una promoción de tipo `Global` activa en el rango de fechas, se aplica al precio.
2. **Código promocional:** el cliente puede ingresar un código (ej. `SAFARI15`) que se valida contra las promociones de tipo `Código`.
3. **Primer servicio:** si el cliente no tiene reservas confirmadas previas, se aplica automáticamente el descuento de tipo `Primer Servicio`.
4. **Pago simulado:** tarjeta pre-llenada o efectivo — confirma la reserva y genera una **boleta** con número, detalle y monto total.

---

## 📁 Estructura del proyecto

```
safari-kids_3/
├── backend/
│   ├── railway.toml                        # Config de deploy en Railway
│   └── src/main/
│       ├── resources/
│       │   ├── application.properties      # Config default (PostgreSQL / Railway)
│       │   └── application-local.properties # Config local (MySQL) — en .gitignore
│       └── java/com/safarikids/
│           ├── controller/                 # Endpoints REST
│           ├── model/                      # Entidades JPA
│           ├── repository/                 # Spring Data repos
│           ├── security/                   # JWT filter + UserDetails
│           ├── service/                    # Lógica de negocio
│           ├── dto/                        # LoginRequest, RegisterRequest, etc.
│           └── config/                     # SecurityConfig, DataInitializer, CorsConfig
└── frontend/
    ├── vercel.json                         # Rewrite /api/* → Railway + SPA fallback
    └── src/
        ├── pages/
        │   ├── landing/                    # LandingPage, ServiciosPublic
        │   ├── auth/                       # Login, Register
        │   ├── cliente/                    # MiCuenta, MisReservas, NuevaReserva (pago)
        │   ├── tienda/                     # TiendaPage, CarritoPage
        │   ├── empleado/                   # EmpleadoHome, EmpleadoReservas
        │   ├── dashboard/                  # Dashboard admin
        │   ├── promociones/                # PromocionesPage (CRUD completo)
        │   └── admin/config/               # HorariosConfig, AsientosConfig, etc.
        ├── components/                     # Sidebar, MainLayout, StatCard, Modal
        ├── context/                        # AuthContext, CartContext
        └── api/                            # Clientes HTTP por módulo
```

---

## 🔒 Seguridad

- Autenticación con **JWT** (expiración 24h)
- Contraseñas hasheadas con **BCrypt**
- Rutas protegidas por rol: `ADMINISTRADOR`, `EMPLEADO`, `CLIENTE`
- Endpoints públicos: `GET /api/servicios/**`, `GET /api/productos/**`, `GET /api/horarios/**`, `GET /api/asientos/**`, `GET /api/promociones/activas`, `POST /api/auth/**`, `POST /api/promociones/validar-codigo`
- CORS configurado vía variable de entorno `CORS_ALLOWED_ORIGINS`

---

## 🐛 Solución de problemas frecuentes

| Síntoma | Causa | Solución |
|---------|-------|----------|
| Backend arranca pero no conecta a la BD | Variables de Railway mal configuradas | Verificar que `SPRING_DATASOURCE_URL` tenga el formato `jdbc:postgresql://...` |
| Frontend muestra error CORS | `CORS_ALLOWED_ORIGINS` no tiene la URL de Vercel | Actualizar la variable en Railway con la URL exacta de Vercel (sin barra final) |
| `/api/*` devuelve 404 en producción | `vercel.json` con URL incorrecta del backend | Actualizar `destination` en `vercel.json` con el dominio real de Railway |
| Tablas no se crean en PostgreSQL | `ddl-auto=update` no alcanza a ejecutar | Verificar logs de Railway; si hay error de schema, cambiar a `create` temporalmente |
| Login devuelve 401 en local | Perfil incorrecto activo | Arrancar con `-Dspring-boot.run.profiles=local` |

# 🦁 Safari Kids — Sistema de Gestión de Peluquería Infantil

Sistema web completo para una peluquería infantil temática. Incluye portal público, panel de cliente, panel de empleado y panel de administrador.

---

## 🛠️ Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 · Vite · TanStack Query · React Router v6 · react-icons |
| Backend | Spring Boot 3.4.1 · Spring Security · JWT |
| Base de datos | MySQL 8.4 |
| ORM | Spring Data JPA · Hibernate 6 |
| Estilos | CSS custom (sistema chunky design propio) |

---

## ⚙️ Requisitos previos

- Java 17 LTS
- Maven 3.x
- Node.js 18+ y npm
- MySQL 8.x

---

## 🗄️ Configurar la base de datos

```sql
-- Crear la base de datos y el usuario
CREATE DATABASE IF NOT EXISTS Safari_kids CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'safari'@'localhost' IDENTIFIED BY '1234';
GRANT ALL PRIVILEGES ON `Safari_kids`.* TO 'safari'@'localhost';
FLUSH PRIVILEGES;
```

> Spring Boot crea las tablas automáticamente al primer arranque (`ddl-auto=update`) e inserta datos de prueba.

---

## 🚀 Levantar el proyecto

### 1. Backend

```bash
cd backend
mvn spring-boot:run
```

Inicia en `http://localhost:8080`. Las tablas y datos de prueba se generan automáticamente.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Inicia en `http://localhost:5173`. El proxy de Vite reenvía `/api` a `localhost:8080`.

---

## 👤 Usuarios de prueba

| Rol | Correo | Contraseña |
|-----|--------|------------|
| Administrador | admin@safarikids.com | admin123 |
| Empleado | carlos@safarikids.com | emp123 |
| Empleado | lucia@safarikids.com | emp123 |
| Cliente | sofia@gmail.com | cli123 |
| Cliente | pedro@gmail.com | cli123 |

---

## 🗂️ Módulos del sistema

### Portal público (`/`)
- Landing page con hero animado, servicios, testimonios, galería y sedes
- Catálogo de servicios (`/servicios`)
- Tienda de productos (`/tienda`)

### Panel cliente
- Mi cuenta con accesos rápidos (`/mi-cuenta`)
- Nueva reserva con selector de servicio, fecha y horario (`/reservar`)
- Historial de reservas con cancelación (`/mi-cuenta/reservas`)
- Historial de compras con boletas (`/mi-cuenta/compras`)
- Carrito y pago simulado con tarjeta (`/carrito`)

### Panel empleado
- Agenda del día con clientes de hoy y próximas citas (`/empleado`)
- Gestión de reservas asignadas (`/mis-citas`)

### Panel administrador
- Dashboard con estadísticas en tiempo real (`/dashboard`)
- Gestión de reservas, clientes y empleados
- Catálogo de servicios y productos
- Control de inventario con alertas de stock bajo
- Módulo de ventas y compras a proveedores
- Reportes y estadísticas
- Gestión de usuarios y roles

---

## 📁 Estructura del proyecto

```
safari-kids_3/
├── backend/
│   └── src/main/java/com/safarikids/
│       ├── controller/     # Endpoints REST
│       ├── model/          # Entidades JPA
│       ├── repository/     # Spring Data repos
│       ├── security/       # JWT filter + UserDetails
│       ├── service/        # Lógica de negocio
│       ├── dto/            # DTOs de request/response
│       └── config/         # SecurityConfig + DataInitializer
└── frontend/
    └── src/
        ├── pages/          # Páginas organizadas por rol
        │   ├── landing/    # LandingPage, ServiciosPublic
        │   ├── auth/       # Login, Register
        │   ├── cliente/    # MiCuenta, MisReservas, MisCompras, NuevaReserva
        │   ├── tienda/     # TiendaPage, CarritoPage
        │   ├── empleado/   # EmpleadoHome, EmpleadoReservas
        │   ├── dashboard/  # Dashboard admin
        │   └── ...         # Demás módulos admin
        ├── components/     # Sidebar, MainLayout, StatCard, Modal, etc.
        ├── context/        # AuthContext, CartContext
        └── api/            # Clientes HTTP por módulo
```

---

## 🔒 Seguridad

- Autenticación con JWT (24h de expiración)
- Rutas protegidas por rol: `ADMINISTRADOR`, `EMPLEADO`, `CLIENTE`
- Endpoints públicos: `GET /api/productos`, `GET /api/servicios`, `GET /api/horarios`, `POST /api/auth/**`
- Contraseñas hasheadas con BCrypt

---

## ✅ Chequeo del sistema

| Componente | Estado |
|-----------|--------|
| Backend API | ✅ Puerto 8080 |
| Frontend dev | ✅ Puerto 5173 |
| Proxy Vite `/api` → 8080 | ✅ Configurado |
| Base de datos | ✅ 23 tablas · usuario `safari` |
| Seed de datos | ✅ Roles, usuarios, servicios, horarios, asientos |
| Build frontend | ✅ 188 módulos · 494 kB |
| JWT Filter | ✅ Try-catch en token malformado |
| Enum BD | ✅ `No_disponible` consistente en Java y MySQL |
| Asiento al reservar | ✅ Se marca `Ocupado` automáticamente |
| Historial de compras | ✅ Con boleta simulada |

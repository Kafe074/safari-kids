# 🦁 Safari Kids — Sistema de Gestión de Peluquería Infantil

Sistema completo para gestión de una peluquería infantil con panel de administrador, empleados y portal de clientes.

## 🛠️ Tecnologías

- **Frontend:** React 18 + Vite + React Query + React Router v6
- **Backend:** Spring Boot 3.4.1 + Spring Security + JWT
- **Base de datos:** MySQL 8
- **ORM:** Spring Data JPA + Hibernate 6

## ⚙️ Requisitos previos

- Java 17 LTS (`sudo apt install openjdk-17-jdk`)
- Maven 3.x (`sudo apt install maven`)
- Node.js 18+ y npm
- MySQL 8.x

## 🗄️ Configurar la base de datos

```sql
-- En MySQL como root:
CREATE DATABASE safari_kids CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER USER 'root'@'localhost' IDENTIFIED WITH caching_sha2_password BY 'tu_password';
FLUSH PRIVILEGES;
```

## 🚀 Levantar el proyecto

### Backend

```bash
cd backend

# 1. Copiar y configurar application.properties
cp src/main/resources/application.properties.example src/main/resources/application.properties
# Editar application.properties con tu contraseña de MySQL

# 2. Ejecutar (usar Java 17 si tienes otra versión por defecto)
JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64 mvn spring-boot:run
```

El backend inicia en `http://localhost:8080`  
Los datos de prueba se cargan automáticamente la primera vez.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend inicia en `http://localhost:5173`

## 👤 Usuarios de prueba

| Rol | Correo | Contraseña |
|-----|--------|------------|
| Administrador | admin@safarikids.com | admin123 |
| Empleado | carlos@safarikids.com | emp123 |
| Empleado | lucia@safarikids.com | emp123 |
| Cliente | sofia@gmail.com | cli123 |
| Cliente | pedro@gmail.com | cli123 |

## 📁 Estructura del proyecto

```
safari-kids_3/
├── backend/          # Spring Boot API
│   └── src/main/java/com/safarikids/
│       ├── controller/   # Endpoints REST
│       ├── model/        # Entidades JPA
│       ├── repository/   # Spring Data repos
│       ├── security/     # JWT + Spring Security
│       └── config/       # Configuración + DataInitializer
└── frontend/         # React + Vite
    └── src/
        ├── pages/        # Páginas por rol
        ├── components/   # Componentes reutilizables
        ├── context/      # Auth + Cart context
        └── api/          # Llamadas al backend
```

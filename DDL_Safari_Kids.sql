-- ═══════════════════════════════════════════════════════════════════════════
--  DDL  –  Sistema Web Safari Kids
--  Base de datos : safari_kids
--  Motor        : PostgreSQL 15+ / Neon (compatible)
--  Generado     : 2025
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Extensiones ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- para gen_random_uuid() si se necesita

-- ─── Tipos enumerados ───────────────────────────────────────────────────────
CREATE TYPE estado_usuario  AS ENUM ('Activo', 'Inactivo');
CREATE TYPE turno_emp       AS ENUM ('Mañana', 'Tarde', 'Completo');
CREATE TYPE estado_emp      AS ENUM ('Activo', 'Inactivo');
CREATE TYPE estado_horario  AS ENUM ('Disponible', 'No_disponible');
CREATE TYPE estado_asiento  AS ENUM ('Disponible', 'Ocupado');
CREATE TYPE estado_svc      AS ENUM ('Disponible', 'No_disponible');
CREATE TYPE estado_res      AS ENUM ('Pendiente', 'Confirmado', 'Cancelado');
CREATE TYPE metodo_pago     AS ENUM ('Efectivo', 'Tarjeta', 'Simulado');
CREATE TYPE estado_pago     AS ENUM ('Pendiente', 'Pagado');
CREATE TYPE estado_prod     AS ENUM ('Activo', 'Inactivo');
CREATE TYPE estado_venta    AS ENUM ('Completado', 'Anulado');
CREATE TYPE metodo_entrega  AS ENUM ('Delivery', 'RecojoEnLocal');
CREATE TYPE estado_entrega  AS ENUM ('Pendiente', 'EntregadoDelivery', 'EntregadaCliente');
CREATE TYPE tipo_mov        AS ENUM ('Entrada', 'Salida', 'Ajuste');
CREATE TYPE tipo_promo      AS ENUM ('Global', 'Codigo', 'PrimerServicio');
CREATE TYPE estado_promo    AS ENUM ('Activa', 'Inactiva');


-- ══════════════════════════════════════════════════════════════════════════
--  MÓDULO: AUTENTICACIÓN Y USUARIOS
-- ══════════════════════════════════════════════════════════════════════════

CREATE TABLE Rol (
    id_rol      SERIAL          PRIMARY KEY,
    nombre      VARCHAR(50)     NOT NULL,
    descripcion VARCHAR(100)
);

CREATE TABLE Usuario (
    id_usuario    SERIAL          PRIMARY KEY,
    nombres       VARCHAR(100)    NOT NULL,
    apellidos     VARCHAR(100)    NOT NULL,
    correo        VARCHAR(100)    NOT NULL UNIQUE,
    contrasena    VARCHAR(255)    NOT NULL,
    estado        estado_usuario  NOT NULL DEFAULT 'Activo',
    fecha_registro DATE           NOT NULL DEFAULT CURRENT_DATE,
    id_rol        INTEGER         NOT NULL REFERENCES Rol(id_rol)
);

CREATE TABLE Cliente (
    id_cliente      SERIAL       PRIMARY KEY,
    id_usuario      INTEGER      NOT NULL UNIQUE REFERENCES Usuario(id_usuario),
    telefono        VARCHAR(20),
    direccion       VARCHAR(150),
    fecha_nacimiento DATE
);

CREATE TABLE Empleado (
    id_empleado  SERIAL       PRIMARY KEY,
    id_usuario   INTEGER      NOT NULL UNIQUE REFERENCES Usuario(id_usuario),
    especialidad VARCHAR(100),
    sucursal     VARCHAR(100),
    turno        turno_emp,
    estado       estado_emp   DEFAULT 'Activo'
);


-- ══════════════════════════════════════════════════════════════════════════
--  MÓDULO: SERVICIOS E INSUMOS
-- ══════════════════════════════════════════════════════════════════════════

CREATE TABLE Servicio (
    id_servicio SERIAL          PRIMARY KEY,
    nombre      VARCHAR(100)    NOT NULL,
    descripcion VARCHAR(150),
    precio      NUMERIC(10,2)   NOT NULL CHECK (precio >= 0),
    duracion    INTEGER         NOT NULL CHECK (duracion > 0),  -- minutos
    estado      estado_svc      NOT NULL DEFAULT 'Disponible'
);

CREATE TABLE Insumo (
    id_insumo    SERIAL      PRIMARY KEY,
    nombre       VARCHAR(100),
    unidad_medida VARCHAR(20),
    stock        INTEGER     DEFAULT 0
);

CREATE TABLE Servicio_Insumo (
    id_serv_insumo SERIAL          PRIMARY KEY,
    id_servicio    INTEGER          NOT NULL REFERENCES Servicio(id_servicio),
    id_insumo      INTEGER          NOT NULL REFERENCES Insumo(id_insumo),
    cantidad       NUMERIC(10,3)    NOT NULL CHECK (cantidad > 0),
    UNIQUE (id_servicio, id_insumo)
);


-- ══════════════════════════════════════════════════════════════════════════
--  MÓDULO: RESERVAS
-- ══════════════════════════════════════════════════════════════════════════

CREATE TABLE Horario (
    id_horario  SERIAL          PRIMARY KEY,
    hora_inicio TIME            NOT NULL,
    hora_fin    TIME            NOT NULL,
    estado      estado_horario  NOT NULL DEFAULT 'Disponible',
    CONSTRAINT chk_horario CHECK (hora_fin > hora_inicio)
);

CREATE TABLE Asiento (
    id_asiento  SERIAL         PRIMARY KEY,
    nombre      VARCHAR(50),
    tipo        VARCHAR(50),
    estado      estado_asiento NOT NULL DEFAULT 'Disponible',
    descripcion VARCHAR(150),
    capacidad   INTEGER        DEFAULT 1
);

CREATE TABLE Reserva (
    id_reserva    SERIAL       PRIMARY KEY,
    id_cliente    INTEGER      NOT NULL REFERENCES Cliente(id_cliente),
    id_empleado   INTEGER      NOT NULL REFERENCES Empleado(id_empleado),
    id_horario    INTEGER      NOT NULL REFERENCES Horario(id_horario),
    id_asiento    INTEGER      NOT NULL REFERENCES Asiento(id_asiento),
    fecha_reserva DATE         NOT NULL,
    estado        estado_res   NOT NULL DEFAULT 'Pendiente',
    local         VARCHAR(100),
    observaciones VARCHAR(200),
    codigo_reserva VARCHAR(20) UNIQUE
);

CREATE TABLE Detalle_Reserva (
    id_detalle  SERIAL          PRIMARY KEY,
    id_reserva  INTEGER          NOT NULL REFERENCES Reserva(id_reserva) ON DELETE CASCADE,
    id_servicio INTEGER          NOT NULL REFERENCES Servicio(id_servicio),
    cantidad    INTEGER          NOT NULL DEFAULT 1 CHECK (cantidad > 0),
    subtotal    NUMERIC(10,2)    NOT NULL CHECK (subtotal >= 0)
);

CREATE TABLE Pago (
    id_pago      SERIAL          PRIMARY KEY,
    id_reserva   INTEGER          NOT NULL UNIQUE REFERENCES Reserva(id_reserva),
    monto_total  NUMERIC(10,2)    NOT NULL CHECK (monto_total >= 0),
    metodo_pago  metodo_pago,
    fecha_pago   DATE,
    estado       estado_pago      NOT NULL DEFAULT 'Pendiente',
    referencia   VARCHAR(100)
);


-- ══════════════════════════════════════════════════════════════════════════
--  MÓDULO: PRODUCTOS Y VENTAS
-- ══════════════════════════════════════════════════════════════════════════

CREATE TABLE Categoria_Producto (
    id_categoria SERIAL       PRIMARY KEY,
    nombre       VARCHAR(100) NOT NULL,
    descripcion  VARCHAR(150)
);

CREATE TABLE Producto (
    id_producto  SERIAL          PRIMARY KEY,
    nombre       VARCHAR(100)    NOT NULL,
    descripcion  VARCHAR(150),
    precio_venta NUMERIC(10,2)   NOT NULL CHECK (precio_venta >= 0),
    costo        NUMERIC(10,2)   CHECK (costo >= 0),
    estado       estado_prod     NOT NULL DEFAULT 'Activo',
    id_categoria INTEGER         REFERENCES Categoria_Producto(id_categoria)
);

CREATE TABLE Venta (
    id_venta          SERIAL           PRIMARY KEY,
    id_cliente        INTEGER          REFERENCES Cliente(id_cliente),
    fecha_venta       TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total             NUMERIC(10,2)    NOT NULL CHECK (total >= 0),
    estado            estado_venta     NOT NULL DEFAULT 'Completado',
    metodo_entrega    metodo_entrega   NOT NULL DEFAULT 'RecojoEnLocal',
    direccion_entrega VARCHAR(200),
    sucursal_entrega  VARCHAR(100),
    costo_delivery    NUMERIC(6,2)     DEFAULT 0.00,
    estado_entrega    estado_entrega   NOT NULL DEFAULT 'Pendiente'
);

CREATE TABLE Detalle_Venta (
    id_detalle_venta SERIAL          PRIMARY KEY,
    id_venta         INTEGER          NOT NULL REFERENCES Venta(id_venta) ON DELETE CASCADE,
    id_producto      INTEGER          NOT NULL REFERENCES Producto(id_producto),
    cantidad         INTEGER          NOT NULL CHECK (cantidad > 0),
    precio_unitario  NUMERIC(10,2)    NOT NULL CHECK (precio_unitario >= 0),
    subtotal         NUMERIC(10,2)    NOT NULL CHECK (subtotal >= 0)
);


-- ══════════════════════════════════════════════════════════════════════════
--  MÓDULO: COMPRAS Y PROVEEDORES
-- ══════════════════════════════════════════════════════════════════════════

CREATE TABLE Proveedor (
    id_proveedor SERIAL       PRIMARY KEY,
    nombre       VARCHAR(100) NOT NULL,
    telefono     VARCHAR(20),
    direccion    VARCHAR(150),
    correo       VARCHAR(100)
);

CREATE TABLE Compra (
    id_compra    SERIAL          PRIMARY KEY,
    id_proveedor INTEGER          NOT NULL REFERENCES Proveedor(id_proveedor),
    fecha_compra TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total        NUMERIC(10,2)   CHECK (total >= 0),
    sucursal     VARCHAR(100)
);

CREATE TABLE Detalle_Compra (
    id_detalle_compra SERIAL         PRIMARY KEY,
    id_compra         INTEGER          NOT NULL REFERENCES Compra(id_compra) ON DELETE CASCADE,
    id_producto       INTEGER          NOT NULL REFERENCES Producto(id_producto),
    cantidad          INTEGER          NOT NULL CHECK (cantidad > 0),
    costo_unitario    NUMERIC(10,2)   CHECK (costo_unitario >= 0),
    subtotal          NUMERIC(10,2)   CHECK (subtotal >= 0)
);


-- ══════════════════════════════════════════════════════════════════════════
--  MÓDULO: INVENTARIO
-- ══════════════════════════════════════════════════════════════════════════

CREATE TABLE Inventario (
    id_inventario SERIAL       PRIMARY KEY,
    id_producto   INTEGER       NOT NULL REFERENCES Producto(id_producto),
    stock_actual  INTEGER       NOT NULL DEFAULT 0 CHECK (stock_actual >= 0),
    stock_minimo  INTEGER       DEFAULT 5,
    ubicacion     VARCHAR(100),
    sucursal      VARCHAR(100)
);

CREATE TABLE Movimiento_Inventario (
    id_movimiento    SERIAL       PRIMARY KEY,
    id_producto      INTEGER       NOT NULL REFERENCES Producto(id_producto),
    tipo             tipo_mov,
    cantidad         INTEGER       NOT NULL CHECK (cantidad > 0),
    fecha_movimiento TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    motivo           VARCHAR(150)
);


-- ══════════════════════════════════════════════════════════════════════════
--  MÓDULO: PROMOCIONES
-- ══════════════════════════════════════════════════════════════════════════

CREATE TABLE Promocion (
    id_promocion   SERIAL          PRIMARY KEY,
    nombre         VARCHAR(100)    NOT NULL,
    descripcion    VARCHAR(150),
    descuento      NUMERIC(5,2)    NOT NULL CHECK (descuento >= 0 AND descuento <= 100),
    codigo         VARCHAR(50)     UNIQUE,
    tipo           tipo_promo      NOT NULL DEFAULT 'Global',
    primer_servicio BOOLEAN        NOT NULL DEFAULT FALSE,
    primer_producto BOOLEAN        NOT NULL DEFAULT FALSE,
    fecha_inicio   DATE,
    fecha_fin      DATE,
    estado         estado_promo    NOT NULL DEFAULT 'Activa',
    CONSTRAINT chk_fechas_promo CHECK (fecha_fin IS NULL OR fecha_fin >= fecha_inicio)
);

-- Tabla pivote M:N entre Promocion y Servicio
CREATE TABLE Promocion_Servicio (
    id_promocion INTEGER NOT NULL REFERENCES Promocion(id_promocion) ON DELETE CASCADE,
    id_servicio  INTEGER NOT NULL REFERENCES Servicio(id_servicio)   ON DELETE CASCADE,
    PRIMARY KEY (id_promocion, id_servicio)
);


-- ══════════════════════════════════════════════════════════════════════════
--  ÍNDICES (mejoran consultas frecuentes)
-- ══════════════════════════════════════════════════════════════════════════

CREATE INDEX idx_usuario_correo        ON Usuario(correo);
CREATE INDEX idx_reserva_cliente       ON Reserva(id_cliente);
CREATE INDEX idx_reserva_fecha         ON Reserva(fecha_reserva);
CREATE INDEX idx_reserva_estado        ON Reserva(estado);
CREATE INDEX idx_reserva_codigo        ON Reserva(codigo_reserva);
CREATE INDEX idx_detalle_res_reserva   ON Detalle_Reserva(id_reserva);
CREATE INDEX idx_venta_cliente         ON Venta(id_cliente);
CREATE INDEX idx_venta_fecha           ON Venta(fecha_venta);
CREATE INDEX idx_detalle_venta_venta   ON Detalle_Venta(id_venta);
CREATE INDEX idx_inventario_producto   ON Inventario(id_producto);
CREATE INDEX idx_inventario_sucursal   ON Inventario(sucursal);
CREATE INDEX idx_movimiento_producto   ON Movimiento_Inventario(id_producto);
CREATE INDEX idx_promocion_codigo      ON Promocion(codigo);


-- ══════════════════════════════════════════════════════════════════════════
--  DATOS INICIALES (seed básico)
-- ══════════════════════════════════════════════════════════════════════════

INSERT INTO Rol (nombre, descripcion) VALUES
    ('ADMINISTRADOR', 'Acceso completo al sistema'),
    ('EMPLEADO',      'Gestión de reservas asignadas'),
    ('CLIENTE',       'Reservas y compras en línea');

-- ─── FIN DEL SCRIPT ──────────────────────────────────────────────────────────

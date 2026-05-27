-- ═══════════════════════════════════════════════════════════════════════════
--  DDL  –  Sistema Web Safari Kids  (versión drawDB-compatible)
--  Importar en: drawdb.app  →  Import SQL
--  Motor: PostgreSQL / Neon
-- ═══════════════════════════════════════════════════════════════════════════


-- ══════════════════════════════════════════════════════════════════════════
--  MÓDULO: AUTENTICACIÓN Y USUARIOS
-- ══════════════════════════════════════════════════════════════════════════

CREATE TABLE Rol (
    id_rol      SERIAL       PRIMARY KEY,
    nombre      VARCHAR(50)  NOT NULL,
    descripcion VARCHAR(100)
);

CREATE TABLE Usuario (
    id_usuario     SERIAL       PRIMARY KEY,
    nombres        VARCHAR(100) NOT NULL,
    apellidos      VARCHAR(100) NOT NULL,
    correo         VARCHAR(100) NOT NULL UNIQUE,
    contrasena     VARCHAR(255) NOT NULL,
    estado         VARCHAR(20)  NOT NULL DEFAULT 'Activo',
    fecha_registro DATE         NOT NULL,
    id_rol         INTEGER      NOT NULL REFERENCES Rol(id_rol)
);

CREATE TABLE Cliente (
    id_cliente       SERIAL       PRIMARY KEY,
    id_usuario       INTEGER      NOT NULL UNIQUE REFERENCES Usuario(id_usuario),
    telefono         VARCHAR(20),
    direccion        VARCHAR(150),
    fecha_nacimiento DATE
);

CREATE TABLE Empleado (
    id_empleado  SERIAL       PRIMARY KEY,
    id_usuario   INTEGER      NOT NULL UNIQUE REFERENCES Usuario(id_usuario),
    especialidad VARCHAR(100),
    sucursal     VARCHAR(100),
    turno        VARCHAR(20),
    estado       VARCHAR(20)  DEFAULT 'Activo'
);


-- ══════════════════════════════════════════════════════════════════════════
--  MÓDULO: SERVICIOS E INSUMOS
-- ══════════════════════════════════════════════════════════════════════════

CREATE TABLE Servicio (
    id_servicio SERIAL          PRIMARY KEY,
    nombre      VARCHAR(100)    NOT NULL,
    descripcion VARCHAR(150),
    precio      DECIMAL(10,2)   NOT NULL,
    duracion    INTEGER         NOT NULL,
    estado      VARCHAR(20)     NOT NULL DEFAULT 'Disponible'
);

CREATE TABLE Insumo (
    id_insumo     SERIAL      PRIMARY KEY,
    nombre        VARCHAR(100),
    unidad_medida VARCHAR(20),
    stock         INTEGER     DEFAULT 0
);

CREATE TABLE Servicio_Insumo (
    id_serv_insumo SERIAL         PRIMARY KEY,
    id_servicio    INTEGER         NOT NULL REFERENCES Servicio(id_servicio),
    id_insumo      INTEGER         NOT NULL REFERENCES Insumo(id_insumo),
    cantidad       DECIMAL(10,3)   NOT NULL
);


-- ══════════════════════════════════════════════════════════════════════════
--  MÓDULO: RESERVAS
-- ══════════════════════════════════════════════════════════════════════════

CREATE TABLE Horario (
    id_horario  SERIAL      PRIMARY KEY,
    hora_inicio TIME        NOT NULL,
    hora_fin    TIME        NOT NULL,
    estado      VARCHAR(20) NOT NULL DEFAULT 'Disponible'
);

CREATE TABLE Asiento (
    id_asiento  SERIAL       PRIMARY KEY,
    nombre      VARCHAR(50),
    tipo        VARCHAR(50),
    estado      VARCHAR(20)  NOT NULL DEFAULT 'Disponible',
    descripcion VARCHAR(150),
    capacidad   INTEGER      DEFAULT 1
);

CREATE TABLE Reserva (
    id_reserva     SERIAL       PRIMARY KEY,
    id_cliente     INTEGER      NOT NULL REFERENCES Cliente(id_cliente),
    id_empleado    INTEGER      NOT NULL REFERENCES Empleado(id_empleado),
    id_horario     INTEGER      NOT NULL REFERENCES Horario(id_horario),
    id_asiento     INTEGER      NOT NULL REFERENCES Asiento(id_asiento),
    fecha_reserva  DATE         NOT NULL,
    estado         VARCHAR(20)  NOT NULL DEFAULT 'Pendiente',
    nombre_local   VARCHAR(100),
    observaciones  VARCHAR(200),
    codigo_reserva VARCHAR(20)  UNIQUE
);

CREATE TABLE Detalle_Reserva (
    id_detalle  SERIAL        PRIMARY KEY,
    id_reserva  INTEGER       NOT NULL REFERENCES Reserva(id_reserva),
    id_servicio INTEGER       NOT NULL REFERENCES Servicio(id_servicio),
    cantidad    INTEGER       NOT NULL DEFAULT 1,
    subtotal    DECIMAL(10,2) NOT NULL
);

CREATE TABLE Pago (
    id_pago     SERIAL        PRIMARY KEY,
    id_reserva  INTEGER       NOT NULL UNIQUE REFERENCES Reserva(id_reserva),
    monto_total DECIMAL(10,2) NOT NULL,
    metodo_pago VARCHAR(20),
    fecha_pago  DATE,
    estado      VARCHAR(20)   NOT NULL DEFAULT 'Pendiente',
    referencia  VARCHAR(100)
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
    id_producto  SERIAL        PRIMARY KEY,
    nombre       VARCHAR(100)  NOT NULL,
    descripcion  VARCHAR(150),
    precio_venta DECIMAL(10,2) NOT NULL,
    costo        DECIMAL(10,2),
    estado       VARCHAR(20)   NOT NULL DEFAULT 'Activo',
    id_categoria INTEGER       REFERENCES Categoria_Producto(id_categoria)
);

CREATE TABLE Venta (
    id_venta          SERIAL        PRIMARY KEY,
    id_cliente        INTEGER       REFERENCES Cliente(id_cliente),
    fecha_venta       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total             DECIMAL(10,2) NOT NULL,
    estado            VARCHAR(20)   NOT NULL DEFAULT 'Completado',
    metodo_entrega    VARCHAR(20)   NOT NULL DEFAULT 'RecojoEnLocal',
    direccion_entrega VARCHAR(200),
    sucursal_entrega  VARCHAR(100),
    costo_delivery    DECIMAL(6,2)  DEFAULT 0.00,
    estado_entrega    VARCHAR(25)   NOT NULL DEFAULT 'Pendiente'
);

CREATE TABLE Detalle_Venta (
    id_detalle_venta SERIAL        PRIMARY KEY,
    id_venta         INTEGER       NOT NULL REFERENCES Venta(id_venta),
    id_producto      INTEGER       NOT NULL REFERENCES Producto(id_producto),
    cantidad         INTEGER       NOT NULL,
    precio_unitario  DECIMAL(10,2) NOT NULL,
    subtotal         DECIMAL(10,2) NOT NULL
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
    id_compra    SERIAL        PRIMARY KEY,
    id_proveedor INTEGER       NOT NULL REFERENCES Proveedor(id_proveedor),
    fecha_compra TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total        DECIMAL(10,2),
    sucursal     VARCHAR(100)
);

CREATE TABLE Detalle_Compra (
    id_detalle_compra SERIAL        PRIMARY KEY,
    id_compra         INTEGER       NOT NULL REFERENCES Compra(id_compra),
    id_producto       INTEGER       NOT NULL REFERENCES Producto(id_producto),
    cantidad          INTEGER       NOT NULL,
    costo_unitario    DECIMAL(10,2),
    subtotal          DECIMAL(10,2)
);


-- ══════════════════════════════════════════════════════════════════════════
--  MÓDULO: INVENTARIO
-- ══════════════════════════════════════════════════════════════════════════

CREATE TABLE Inventario (
    id_inventario SERIAL       PRIMARY KEY,
    id_producto   INTEGER      NOT NULL REFERENCES Producto(id_producto),
    stock_actual  INTEGER      NOT NULL DEFAULT 0,
    stock_minimo  INTEGER      DEFAULT 5,
    ubicacion     VARCHAR(100),
    sucursal      VARCHAR(100)
);

CREATE TABLE Movimiento_Inventario (
    id_movimiento    SERIAL       PRIMARY KEY,
    id_producto      INTEGER      NOT NULL REFERENCES Producto(id_producto),
    tipo             VARCHAR(20),
    cantidad         INTEGER      NOT NULL,
    fecha_movimiento TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    motivo           VARCHAR(150)
);


-- ══════════════════════════════════════════════════════════════════════════
--  MÓDULO: PROMOCIONES
-- ══════════════════════════════════════════════════════════════════════════

CREATE TABLE Promocion (
    id_promocion    SERIAL        PRIMARY KEY,
    nombre          VARCHAR(100)  NOT NULL,
    descripcion     VARCHAR(150),
    descuento       DECIMAL(5,2)  NOT NULL,
    codigo          VARCHAR(50)   UNIQUE,
    tipo            VARCHAR(20)   NOT NULL DEFAULT 'Global',
    primer_servicio BOOLEAN       NOT NULL DEFAULT FALSE,
    primer_producto BOOLEAN       NOT NULL DEFAULT FALSE,
    fecha_inicio    DATE,
    fecha_fin       DATE,
    estado          VARCHAR(20)   NOT NULL DEFAULT 'Activa'
);

CREATE TABLE Promocion_Servicio (
    id_promocion INTEGER NOT NULL REFERENCES Promocion(id_promocion),
    id_servicio  INTEGER NOT NULL REFERENCES Servicio(id_servicio),
    PRIMARY KEY (id_promocion, id_servicio)
);

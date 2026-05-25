package com.safarikids.config;

import com.safarikids.model.*;
import com.safarikids.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RolRepository rolRepo;
    private final UsuarioRepository usuarioRepo;
    private final ClienteRepository clienteRepo;
    private final EmpleadoRepository empleadoRepo;
    private final ServicioRepository servicioRepo;
    private final HorarioRepository horarioRepo;
    private final AsientoRepository asientoRepo;
    private final CategoriaProductoRepository categoriaRepo;
    private final ProductoRepository productoRepo;
    private final InventarioRepository inventarioRepo;
    private final ProveedorRepository proveedorRepo;
    private final PasswordEncoder encoder;

    @Override
    public void run(String... args) {
        if (rolRepo.count() > 0) return; // already seeded

        // ── Roles ─────────────────────────────────────────────────────────
        Rol rolAdmin = rolRepo.save(Rol.builder().nombre("Administrador").descripcion("Control total del sistema").build());
        Rol rolEmp   = rolRepo.save(Rol.builder().nombre("Empleado").descripcion("Gestión de reservas").build());
        Rol rolCli   = rolRepo.save(Rol.builder().nombre("Cliente").descripcion("Reservas propias").build());

        // ── Usuarios ──────────────────────────────────────────────────────
        Usuario uAdmin = usuarioRepo.save(Usuario.builder()
            .nombres("María").apellidos("García").correo("admin@safarikids.com")
            .contrasena(encoder.encode("admin123")).estado(Usuario.EstadoUsuario.Activo)
            .fechaRegistro(LocalDate.now()).rol(rolAdmin).build());

        Usuario uEmp1 = usuarioRepo.save(Usuario.builder()
            .nombres("Carlos").apellidos("Vera").correo("carlos@safarikids.com")
            .contrasena(encoder.encode("emp123")).estado(Usuario.EstadoUsuario.Activo)
            .fechaRegistro(LocalDate.now()).rol(rolEmp).build());

        Usuario uEmp2 = usuarioRepo.save(Usuario.builder()
            .nombres("Lucía").apellidos("Torres").correo("lucia@safarikids.com")
            .contrasena(encoder.encode("emp123")).estado(Usuario.EstadoUsuario.Activo)
            .fechaRegistro(LocalDate.now()).rol(rolEmp).build());

        Usuario uCli1 = usuarioRepo.save(Usuario.builder()
            .nombres("Sofía").apellidos("Ríos").correo("sofia@gmail.com")
            .contrasena(encoder.encode("cli123")).estado(Usuario.EstadoUsuario.Activo)
            .fechaRegistro(LocalDate.now()).rol(rolCli).build());

        Usuario uCli2 = usuarioRepo.save(Usuario.builder()
            .nombres("Pedro").apellidos("Lara").correo("pedro@gmail.com")
            .contrasena(encoder.encode("cli123")).estado(Usuario.EstadoUsuario.Activo)
            .fechaRegistro(LocalDate.now()).rol(rolCli).build());

        // ── Empleados ─────────────────────────────────────────────────────
        empleadoRepo.save(Empleado.builder().usuario(uEmp1).especialidad("Corte Infantil").turno(Empleado.Turno.Mañana).estado(Empleado.EstadoEmpleado.Activo).build());
        empleadoRepo.save(Empleado.builder().usuario(uEmp2).especialidad("Peinados y Tintes").turno(Empleado.Turno.Tarde).estado(Empleado.EstadoEmpleado.Activo).build());

        // ── Clientes ──────────────────────────────────────────────────────
        clienteRepo.save(Cliente.builder().usuario(uCli1).telefono("999001122").direccion("Av. Ferrocarril 123").fechaNacimiento(LocalDate.of(2000,3,15)).build());
        clienteRepo.save(Cliente.builder().usuario(uCli2).telefono("999003344").direccion("Jr. Arequipa 456").fechaNacimiento(LocalDate.of(1995,7,20)).build());

        // ── Servicios ─────────────────────────────────────────────────────
        String[] nombres  = {"Corte Infantil","Tinte & Color","Lavado & Peinado","Tratamiento Capilar","Peinados Creativos","Spa Capilar","Pack Completo","Primera Vez"};
        String[] descs    = {"Corte moderno adaptado a cada niño","Colores seguros y vibrantes","Lavado, acondicionador y peinado","Hidratación profunda del cabello","Trenzas, moños y peinados de fantasía","Masaje de cuero cabelludo incluido","Corte + lavado + peinado completo","Primer corte con certificado especial"};
        int[]    precios  = {25,45,20,35,30,40,70,35};
        int[]    duras    = {30,60,25,45,40,50,90,35};

        for (int i = 0; i < nombres.length; i++) {
            servicioRepo.save(Servicio.builder()
                .nombre(nombres[i]).descripcion(descs[i])
                .precio(BigDecimal.valueOf(precios[i])).duracion(duras[i])
                .estado(Servicio.EstadoServicio.Disponible).build());
        }

        // ── Horarios ──────────────────────────────────────────────────────
        String[][] horas = {{"09:00","09:30"},{"09:30","10:00"},{"10:00","10:30"},{"10:30","11:00"},{"11:00","11:30"},{"11:30","12:00"},{"14:00","14:30"},{"14:30","15:00"},{"15:00","15:30"},{"15:30","16:00"},{"16:00","16:30"},{"16:30","17:00"}};
        for (String[] h : horas) {
            horarioRepo.save(Horario.builder()
                .horaInicio(LocalTime.parse(h[0])).horaFin(LocalTime.parse(h[1]))
                .estado(Horario.EstadoHorario.Disponible).build());
        }

        // ── Asientos ──────────────────────────────────────────────────────
        String[][] sillas = {{"Silla Girafa","Infantil"},{"Silla León","Infantil"},{"Silla Elefante","Infantil"},{"Silla Tigre","Infantil"},{"Silla Mono","Infantil"},{"Silla Cebra","Adulto"}};
        for (String[] s : sillas) {
            asientoRepo.save(Asiento.builder().nombre(s[0]).tipo(s[1]).capacidad(1).estado(Asiento.EstadoAsiento.Disponible).descripcion("Silla temática " + s[0]).build());
        }

        // ── Categorías y Productos ────────────────────────────────────────
        CategoriaProducto catShampoo = categoriaRepo.save(CategoriaProducto.builder().nombre("Shampoo & Acondicionador").descripcion("Productos de lavado").build());
        CategoriaProducto catEstilo  = categoriaRepo.save(CategoriaProducto.builder().nombre("Estilizado").descripcion("Geles, ceras y fijadores").build());
        CategoriaProducto catTrat    = categoriaRepo.save(CategoriaProducto.builder().nombre("Tratamientos").descripcion("Mascarillas y sueros").build());
        CategoriaProducto catAcc     = categoriaRepo.save(CategoriaProducto.builder().nombre("Accesorios").descripcion("Peinetas, ligas y clips").build());

        Object[][] productos = {
            {"Shampoo Infantil 400ml",catShampoo,25.00,18.00},{"Acondicionador Kids 300ml",catShampoo,22.00,15.00},
            {"Shampoo Anti-nudos",catShampoo,28.00,20.00},{"Gel Sin Alcohol",catEstilo,18.00,12.00},
            {"Cera Moldeable Suave",catEstilo,22.00,15.00},{"Spray Fijador Kids",catEstilo,20.00,13.00},
            {"Mascarilla Nutrición",catTrat,35.00,24.00},{"Sérum Brillo Kids",catTrat,30.00,20.00},
            {"Set Ligas Colores x50",catAcc,12.00,7.00},{"Peineta Decorada",catAcc,8.00,4.00},
        };

        String[] sucursales = {
            "Sede Principal – Jr. Ayacucho 456",
            "El Tambo – Av. Ferrocarril 789",
            "Chilca – Calle Real 234"
        };
        for (Object[] p : productos) {
            Producto prod = productoRepo.save(Producto.builder()
                .nombre((String)p[0]).categoria((CategoriaProducto)p[1])
                .precioVenta(BigDecimal.valueOf((Double)p[2])).costo(BigDecimal.valueOf((Double)p[3]))
                .estado(Producto.EstadoProducto.Activo).build());
            for (String suc : sucursales) {
                inventarioRepo.save(Inventario.builder()
                    .producto(prod).stockActual((int)(Math.random()*30)+5).stockMinimo(5)
                    .ubicacion("Estante A").sucursal(suc).build());
            }
        }

        // ── Proveedor ─────────────────────────────────────────────────────
        proveedorRepo.save(Proveedor.builder().nombre("Distribuidora BabyHair SAC").telefono("064-123456").direccion("Av. Real 789, Huancayo").correo("ventas@babyhair.com").build());
        proveedorRepo.save(Proveedor.builder().nombre("Cosméticos Andinos EIRL").telefono("064-234567").direccion("Jr. Loreto 234, Huancayo").correo("info@cosmetichub.com").build());

        System.out.println("✅ Safari Kids - Datos iniciales cargados correctamente");
    }
}

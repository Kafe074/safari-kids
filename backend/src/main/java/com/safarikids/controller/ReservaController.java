package com.safarikids.controller;

import com.safarikids.dto.ApiResponse;
import com.safarikids.model.*;
import com.safarikids.repository.*;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reservas")
@RequiredArgsConstructor
public class ReservaController {

    private final ReservaRepository repository;
    private final ClienteRepository clienteRepo;
    private final EmpleadoRepository empleadoRepo;
    private final HorarioRepository horarioRepo;
    private final AsientoRepository asientoRepo;
    private final ServicioRepository servicioRepo;
    private final DetalleReservaRepository detalleRepo;
    private final UsuarioRepository usuarioRepo;
    private final ServicioInsumoRepository servicioInsumoRepo;
    private final InsumoRepository insumoRepo;
    private final RolRepository rolRepo;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    private final com.safarikids.service.EmailService emailService;
    private final com.safarikids.service.TelegramService telegramService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Reserva>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(repository.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Reserva>> getById(@PathVariable Integer id) {
        return repository.findById(id).map(r -> ResponseEntity.ok(ApiResponse.ok(r)))
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/cliente/{idCliente}")
    public ResponseEntity<ApiResponse<List<Reserva>>> byCliente(@PathVariable Integer idCliente) {
        return ResponseEntity.ok(ApiResponse.ok(repository.findByClienteIdCliente(idCliente)));
    }

    @Transactional(readOnly = true)
    @GetMapping("/mis-reservas")
    public ResponseEntity<ApiResponse<List<Reserva>>> misReservas() {
        String correo = SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioRepo.findByCorreo(correo)
            .flatMap(u -> clienteRepo.findByUsuarioIdUsuario(u.getIdUsuario()))
            .map(c -> ResponseEntity.ok(ApiResponse.ok(repository.findByClienteIdCliente(c.getIdCliente()))))
            .orElse(ResponseEntity.ok(ApiResponse.ok(List.of())));
    }

    @Transactional(readOnly = true)
    @GetMapping("/mis-asignadas")
    public ResponseEntity<ApiResponse<List<Reserva>>> misAsignadas() {
        String correo = SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioRepo.findByCorreo(correo)
            .flatMap(u -> empleadoRepo.findByUsuarioIdUsuario(u.getIdUsuario()))
            .map(e -> ResponseEntity.ok(ApiResponse.ok(repository.findByEmpleadoIdEmpleado(e.getIdEmpleado()))))
            .orElse(ResponseEntity.ok(ApiResponse.ok(List.of())));
    }

    @GetMapping("/rango")
    public ResponseEntity<ApiResponse<List<Reserva>>> byRango(
            @RequestParam String inicio, @RequestParam String fin) {
        return ResponseEntity.ok(ApiResponse.ok(
            repository.findByFechaReservaBetween(LocalDate.parse(inicio), LocalDate.parse(fin))));
    }

    @Transactional
    @GetMapping("/codigo/{codigo}")
    public ResponseEntity<ApiResponse<Reserva>> porCodigo(@PathVariable String codigo) {
        return repository.findByCodigoReserva(codigo.toUpperCase())
            .map(r -> ResponseEntity.ok(ApiResponse.ok(r)))
            .orElse(ResponseEntity.status(404).body(ApiResponse.error("Código no encontrado")));
    }

    @Transactional
    @PostMapping("/crear")
    public ResponseEntity<ApiResponse<Map<String, Object>>> crear(@RequestBody CrearReservaRequest req) {
        String correo = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioRepo.findByCorreo(correo)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Cliente cliente = clienteRepo.findByUsuarioIdUsuario(usuario.getIdUsuario())
            .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        String errHora = horarioYaPaso(req.getFecha(), req.getHoraInicio());
        if (errHora != null) return ResponseEntity.badRequest().body(ApiResponse.error(errHora));

        // Online: la confirmación se envía tras el pago (PagoController), así que aquí no notificamos.
        Map<String, Object> result = registrarReserva(cliente, req.getFecha(), req.getHoraInicio(),
            req.getIdServicio(), req.getIdAsiento(), req.getIdEmpleado(), req.getLocal(), req.getObservaciones(), false);
        return ResponseEntity.ok(ApiResponse.ok("Reserva creada", result));
    }

    /** Reserva presencial (walk-in): el staff registra a un cliente por DNI; si no existe se crea
     *  una cuenta provisional que el cliente podrá reclamar luego desde la web con el mismo DNI. */
    @Transactional
    @PostMapping("/presencial")
    public ResponseEntity<ApiResponse<Map<String, Object>>> crearPresencial(@RequestBody PresencialReservaRequest req) {
        String dni = req.getDni() == null ? null : req.getDni().trim();
        if (dni == null || !dni.matches("\\d{8}"))
            return ResponseEntity.badRequest().body(ApiResponse.error("El DNI debe tener 8 dígitos"));

        String errHora = horarioYaPaso(req.getFecha(), req.getHoraInicio());
        if (errHora != null) return ResponseEntity.badRequest().body(ApiResponse.error(errHora));

        Cliente cliente = clienteRepo.findByDni(dni).orElseGet(() -> {
            Rol rolCliente = rolRepo.findByNombre("Cliente")
                .orElseThrow(() -> new RuntimeException("Rol Cliente no encontrado"));
            Usuario usuario = Usuario.builder()
                .nombres(req.getNombres() != null ? req.getNombres() : "Cliente")
                .apellidos(req.getApellidos() != null ? req.getApellidos() : dni)
                .correo(dni + "@walkin.safarikids")
                .contrasena(passwordEncoder.encode(UUID.randomUUID().toString()))
                .estado(Usuario.EstadoUsuario.Activo)
                .fechaRegistro(LocalDate.now())
                .rol(rolCliente)
                .build();
            usuarioRepo.save(usuario);
            return clienteRepo.save(Cliente.builder()
                .usuario(usuario)
                .dni(dni)
                .reclamada(false)
                .telefono(req.getTelefono())
                .build());
        });

        // Walk-in: no pasa por pago online, así que enviamos la confirmación aquí mismo.
        Map<String, Object> result = registrarReserva(cliente, req.getFecha(), req.getHoraInicio(),
            req.getIdServicio(), req.getIdAsiento(), req.getIdEmpleado(), req.getLocal(), req.getObservaciones(), true);
        result.put("dni", dni);
        result.put("cuentaNueva", Boolean.FALSE.equals(cliente.getReclamada()));
        return ResponseEntity.ok(ApiResponse.ok("Reserva presencial creada", result));
    }

    /** Devuelve un mensaje de error si el horario elegido (fecha+hora) ya pasó; null si es válido/futuro. */
    private String horarioYaPaso(String fecha, String horaInicio) {
        try {
            java.time.LocalDateTime inicio = java.time.LocalDateTime.of(
                LocalDate.parse(fecha), LocalTime.parse(horaInicio));
            if (inicio.isBefore(java.time.LocalDateTime.now()))
                return "Ese horario ya pasó. Elige un horario más tarde o para otro día.";
        } catch (Exception ignored) { /* fecha/hora mal formadas: se validan más adelante */ }
        return null;
    }

    /** Lógica común de creación de reserva (web y presencial). */
    private Map<String, Object> registrarReserva(Cliente cliente, String fecha, String horaInicio,
            Integer idServicio, Integer idAsiento, Integer idEmpleado, String local, String observaciones,
            boolean notificarConfirmacion) {
        LocalDate fechaDate = LocalDate.parse(fecha);

        Horario horario = horarioRepo.findByHoraInicio(LocalTime.parse(horaInicio))
            .orElseGet(() -> horarioRepo.findAll().stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Sin horarios disponibles")));

        Empleado empleado = asignarEmpleado(fechaDate, local, idEmpleado);

        // Usar asiento seleccionado o auto-asignar
        Asiento asiento;
        if (idAsiento != null) {
            asiento = asientoRepo.findById(idAsiento)
                .orElseThrow(() -> new RuntimeException("Asiento no encontrado"));
            if (asiento.getEstado() != Asiento.EstadoAsiento.Disponible) {
                throw new RuntimeException("El asiento seleccionado no está disponible");
            }
        } else {
            asiento = asientoRepo.findAll().stream()
                .filter(a -> a.getEstado() == Asiento.EstadoAsiento.Disponible)
                .findFirst().orElseThrow(() -> new RuntimeException("Sin asientos disponibles"));
        }
        asiento.setEstado(Asiento.EstadoAsiento.Ocupado);
        asientoRepo.save(asiento);

        String codigo = "SKR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Reserva reserva = Reserva.builder()
            .cliente(cliente)
            .empleado(empleado)
            .horario(horario)
            .asiento(asiento)
            .fechaReserva(fechaDate)
            .estado(Reserva.EstadoReserva.Pendiente)
            .local(local)
            .observaciones(observaciones)
            .codigoReserva(codigo)
            .build();
        repository.save(reserva);

        String servicioNombre = null;
        if (idServicio != null) {
            var servicioOpt = servicioRepo.findById(idServicio);
            if (servicioOpt.isPresent()) {
                Servicio servicio = servicioOpt.get();
                servicioNombre = servicio.getNombre();
                DetalleReserva detalle = DetalleReserva.builder()
                    .reserva(reserva).servicio(servicio).cantidad(1).subtotal(servicio.getPrecio()).build();
                detalleRepo.save(detalle);
            }
        }

        // Aviso interno al personal por Telegram (no bloquea ni rompe la reserva)
        telegramService.avisarNuevaReserva(codigo, nombreUsuario(cliente.getUsuario()), servicioNombre,
            fecha, horaInicio, local, nombreUsuario(empleado.getUsuario()));

        // Confirmación al cliente (async, tolerante a fallos; correos walk-in ficticios se omiten solos).
        // El pago aún no ocurre → efectivo=true ("registrada, presenta tu código al llegar").
        Usuario uCliente = cliente.getUsuario();
        if (notificarConfirmacion && uCliente != null) {
            emailService.enviarConfirmacionReserva(uCliente.getCorreo(), uCliente.getNombres(),
                codigo, servicioNombre, fecha, horaInicio, local, true);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("idReserva", reserva.getIdReserva());
        result.put("codigoReserva", codigo);
        return result;
    }

    /** Nombre completo de un usuario para mostrar en avisos ("Nombres Apellidos"). */
    private String nombreUsuario(Usuario u) {
        if (u == null) return null;
        String nom = u.getNombres() != null ? u.getNombres() : "";
        String ape = u.getApellidos() != null ? u.getApellidos() : "";
        return (nom + " " + ape).trim();
    }

    /** Si el cliente eligió un estilista, lo usa; si no, asigna por carga de trabajo del día y sede. */
    private Empleado asignarEmpleado(LocalDate fechaDate, String local, Integer idEmpleado) {
        if (idEmpleado != null) {
            Empleado empleado = empleadoRepo.findById(idEmpleado)
                .orElseThrow(() -> new RuntimeException("Estilista no encontrado"));
            if (empleado.getEstado() != Empleado.EstadoEmpleado.Activo)
                throw new RuntimeException("El estilista seleccionado no está disponible");
            return empleado;
        }

        List<Empleado> activos;
        if (local != null && !local.isBlank()) {
            activos = empleadoRepo.findBySucursalAndEstado(local, Empleado.EstadoEmpleado.Activo);
            if (activos.isEmpty()) activos = empleadoRepo.findByEstado(Empleado.EstadoEmpleado.Activo);
        } else {
            activos = empleadoRepo.findByEstado(Empleado.EstadoEmpleado.Activo);
        }
        if (activos.isEmpty()) throw new RuntimeException("Sin empleados activos");

        Map<Integer, Long> carga = repository.findByFechaReserva(fechaDate).stream()
            .filter(r -> r.getEmpleado() != null && r.getEstado() != Reserva.EstadoReserva.Cancelado)
            .collect(Collectors.groupingBy(r -> r.getEmpleado().getIdEmpleado(), Collectors.counting()));

        long minCarga = activos.stream()
            .mapToLong(e -> carga.getOrDefault(e.getIdEmpleado(), 0L))
            .min().orElse(0);

        List<Empleado> candidatos = activos.stream()
            .filter(e -> carga.getOrDefault(e.getIdEmpleado(), 0L) == minCarga)
            .collect(Collectors.toList());

        return candidatos.get(new Random().nextInt(candidatos.size()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Reserva>> create(@RequestBody Reserva reserva) {
        return ResponseEntity.ok(ApiResponse.ok("Reserva creada", repository.save(reserva)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Reserva>> update(@PathVariable Integer id, @RequestBody Reserva reserva) {
        if (!repository.existsById(id)) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(ApiResponse.ok("Actualizada", repository.save(reserva)));
    }

    @Transactional
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
        if (!repository.existsById(id)) return ResponseEntity.notFound().build();
        detalleRepo.deleteByReservaIdReserva(id);
        repository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok("Eliminada", null));
    }

    @Transactional
    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<ApiResponse<Void>> cancelar(@PathVariable Integer id) {
        return repository.findById(id).map(r -> {
            r.setEstado(Reserva.EstadoReserva.Cancelado);
            repository.save(r);
            String fechaStr = r.getFechaReserva() != null ? r.getFechaReserva().toString() : null;
            if (r.getCliente() != null && r.getCliente().getUsuario() != null) {
                Usuario u = r.getCliente().getUsuario();
                emailService.enviarCancelacionReserva(u.getCorreo(), u.getNombres(),
                    r.getCodigoReserva(), fechaStr);
            }
            telegramService.avisarCancelacion(r.getCodigoReserva(),
                r.getCliente() != null ? nombreUsuario(r.getCliente().getUsuario()) : null, fechaStr);
            return ResponseEntity.ok(ApiResponse.ok("Reserva cancelada", (Void) null));
        }).orElse(ResponseEntity.notFound().build());
    }

    @Transactional
    @PatchMapping("/{id}/confirmar")
    public ResponseEntity<ApiResponse<Void>> confirmar(@PathVariable Integer id) {
        return repository.findById(id).map(r -> {
            r.setEstado(Reserva.EstadoReserva.Confirmado);
            repository.save(r);

            // Descontar insumos de cada servicio en la reserva
            detalleRepo.findByReservaIdReserva(id).forEach(detalle -> {
                servicioInsumoRepo.findByServicioIdServicio(detalle.getServicio().getIdServicio())
                    .forEach(si -> {
                        Insumo insumo = si.getInsumo();
                        int descuento = si.getCantidad().intValue();
                        insumo.setStock(Math.max(0, insumo.getStock() - descuento));
                        insumoRepo.save(insumo);
                    });
            });

            return ResponseEntity.ok(ApiResponse.ok("Reserva confirmada", (Void) null));
        }).orElse(ResponseEntity.notFound().build());
    }

    @Data
    public static class CrearReservaRequest {
        private String fecha;
        private String horaInicio;
        private Integer idServicio;
        private Integer idAsiento;
        private Integer idEmpleado;
        private String local;
        private String observaciones;
    }

    @Data
    public static class PresencialReservaRequest {
        private String dni;
        private String nombres;
        private String apellidos;
        private String telefono;
        private String fecha;
        private String horaInicio;
        private Integer idServicio;
        private Integer idAsiento;
        private Integer idEmpleado;
        private String local;
        private String observaciones;
    }
}

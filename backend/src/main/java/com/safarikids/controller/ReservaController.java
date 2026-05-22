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
import java.util.List;
import java.util.Map;
import java.util.Random;
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
    @PostMapping("/crear")
    public ResponseEntity<ApiResponse<Integer>> crear(@RequestBody CrearReservaRequest req) {
        String correo = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioRepo.findByCorreo(correo)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Cliente cliente = clienteRepo.findByUsuarioIdUsuario(usuario.getIdUsuario())
            .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        LocalDate fechaDate = LocalDate.parse(req.getFecha());

        Horario horario = horarioRepo.findByHoraInicio(LocalTime.parse(req.getHoraInicio()))
            .orElseGet(() -> horarioRepo.findAll().stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Sin horarios disponibles")));

        // ── Asignación balanceada por carga del día + filtro de sucursal ─────
        String sucursalSolicitada = req.getLocal();
        List<Empleado> activos;
        if (sucursalSolicitada != null && !sucursalSolicitada.isBlank()) {
            activos = empleadoRepo.findBySucursalAndEstado(sucursalSolicitada, Empleado.EstadoEmpleado.Activo);
            if (activos.isEmpty()) activos = empleadoRepo.findByEstado(Empleado.EstadoEmpleado.Activo); // fallback
        } else {
            activos = empleadoRepo.findByEstado(Empleado.EstadoEmpleado.Activo);
        }
        if (activos.isEmpty()) throw new RuntimeException("Sin empleados activos");

        // Contar reservas NO canceladas por empleado para esa fecha
        Map<Integer, Long> carga = repository.findByFechaReserva(fechaDate).stream()
            .filter(r -> r.getEmpleado() != null
                      && r.getEstado() != Reserva.EstadoReserva.Cancelado)
            .collect(Collectors.groupingBy(
                r -> r.getEmpleado().getIdEmpleado(), Collectors.counting()));

        // Mínima carga del día entre todos los activos
        long minCarga = activos.stream()
            .mapToLong(e -> carga.getOrDefault(e.getIdEmpleado(), 0L))
            .min().orElse(0);

        // Empleados con menor carga (desempate aleatorio)
        List<Empleado> candidatos = activos.stream()
            .filter(e -> carga.getOrDefault(e.getIdEmpleado(), 0L) == minCarga)
            .collect(Collectors.toList());

        Empleado empleado = candidatos.get(new Random().nextInt(candidatos.size()));
        // ─────────────────────────────────────────────────────────────────────

        Asiento asiento = asientoRepo.findAll().stream()
            .filter(a -> a.getEstado() == Asiento.EstadoAsiento.Disponible)
            .findFirst().orElseThrow(() -> new RuntimeException("Sin asientos disponibles"));
        asiento.setEstado(Asiento.EstadoAsiento.Ocupado);
        asientoRepo.save(asiento);

        Reserva reserva = Reserva.builder()
            .cliente(cliente)
            .empleado(empleado)
            .horario(horario)
            .asiento(asiento)
            .fechaReserva(fechaDate)
            .estado(Reserva.EstadoReserva.Pendiente)
            .local(req.getLocal())
            .observaciones(req.getObservaciones())
            .build();
        repository.save(reserva);

        if (req.getIdServicio() != null) {
            servicioRepo.findById(req.getIdServicio()).ifPresent(servicio -> {
                DetalleReserva detalle = DetalleReserva.builder()
                    .reserva(reserva)
                    .servicio(servicio)
                    .cantidad(1)
                    .subtotal(servicio.getPrecio())
                    .build();
                detalleRepo.save(detalle);
            });
        }

        return ResponseEntity.ok(ApiResponse.ok("Reserva creada", reserva.getIdReserva()));
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
        private String local;
        private String observaciones;
    }
}

package com.safarikids.controller;

import com.safarikids.dto.ApiResponse;
import com.safarikids.model.*;
import com.safarikids.repository.*;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/pagos")
@RequiredArgsConstructor
public class PagoController {

    private final PagoRepository           repository;
    private final ReservaRepository        reservaRepo;
    private final PromocionRepository      promocionRepo;
    private final DetalleReservaRepository detalleReservaRepo;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Pago>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(repository.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Pago>> getById(@PathVariable Integer id) {
        return repository.findById(id)
            .map(e -> ResponseEntity.ok(ApiResponse.ok(e)))
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/boleta/{idPago}")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<Map<String, Object>>> getBoleta(@PathVariable Integer idPago) {
        return repository.findById(idPago)
            .map(pago -> {
                Map<String, Object> boleta = buildBoleta(pago);
                return ResponseEntity.ok(ApiResponse.ok(boleta));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/reserva/{idReserva}")
    public ResponseEntity<ApiResponse<Pago>> getByReserva(@PathVariable Integer idReserva) {
        return repository.findByReservaIdReserva(idReserva)
            .map(p -> ResponseEntity.ok(ApiResponse.ok(p)))
            .orElse(ResponseEntity.notFound().build());
    }

    @Transactional
    @PostMapping("/procesar")
    public ResponseEntity<ApiResponse<Map<String, Object>>> procesarPago(@RequestBody ProcesarPagoRequest req) {
        Reserva reserva = reservaRepo.findById(req.getIdReserva())
            .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));

        if (repository.findByReservaIdReserva(req.getIdReserva()).isPresent()) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Esta reserva ya tiene un pago registrado"));
        }

        BigDecimal precioBase = calcularPrecioBase(reserva);
        BigDecimal descuento  = BigDecimal.ZERO;
        String    promoAplicada = null;

        // Aplicar código de promoción si se proporcionó
        if (req.getCodigoPromocion() != null && !req.getCodigoPromocion().isBlank()) {
            var promoOpt = promocionRepo.findByCodigo(req.getCodigoPromocion().trim().toUpperCase())
                .filter(p -> p.getEstado() == Promocion.EstadoPromocion.Activa)
                .filter(p -> {
                    LocalDate hoy = LocalDate.now();
                    boolean ok1 = p.getFechaInicio() == null || !hoy.isBefore(p.getFechaInicio());
                    boolean ok2 = p.getFechaFin()    == null || !hoy.isAfter(p.getFechaFin());
                    return ok1 && ok2;
                });
            if (promoOpt.isPresent()) {
                Promocion promo = promoOpt.get();
                descuento    = precioBase.multiply(promo.getDescuento()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                promoAplicada = promo.getNombre();
            }
        } else {
            // Verificar descuento global activo
            var globalPromos = promocionRepo.findByTipoAndEstado(Promocion.TipoPromocion.Global, Promocion.EstadoPromocion.Activa)
                .stream().filter(p -> {
                    LocalDate hoy = LocalDate.now();
                    boolean ok1 = p.getFechaInicio() == null || !hoy.isBefore(p.getFechaInicio());
                    boolean ok2 = p.getFechaFin()    == null || !hoy.isAfter(p.getFechaFin());
                    return ok1 && ok2;
                }).toList();

            if (!globalPromos.isEmpty()) {
                Promocion promo = globalPromos.get(0);
                descuento    = precioBase.multiply(promo.getDescuento()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                promoAplicada = promo.getNombre() + " (automática)";
            }

            // Verificar descuento primer servicio para clientes nuevos
            if (descuento.compareTo(BigDecimal.ZERO) == 0 && reserva.getCliente() != null) {
                long reservasConfirmadas = reservaRepo.countByClienteIdClienteAndEstado(
                    reserva.getCliente().getIdCliente(), Reserva.EstadoReserva.Confirmado);
                if (reservasConfirmadas == 0) {
                    var primerServicioPromos = promocionRepo.findByPrimerServicioTrueAndEstado(Promocion.EstadoPromocion.Activa);
                    if (!primerServicioPromos.isEmpty()) {
                        Promocion promo = primerServicioPromos.get(0);
                        descuento    = precioBase.multiply(promo.getDescuento()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                        promoAplicada = promo.getNombre() + " (primer servicio)";
                    }
                }
            }
        }

        BigDecimal montoFinal = precioBase.subtract(descuento).max(BigDecimal.ZERO);
        String referencia = "SIM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Pago pago = Pago.builder()
            .reserva(reserva)
            .montoTotal(montoFinal)
            .metodoPago(Pago.MetodoPago.valueOf(req.getMetodoPago() != null ? req.getMetodoPago() : "Simulado"))
            .fechaPago(LocalDate.now())
            .estado(Pago.EstadoPago.Pagado)
            .referencia(referencia)
            .build();
        repository.save(pago);

        // Confirmar la reserva automáticamente al pagar
        reserva.setEstado(Reserva.EstadoReserva.Confirmado);
        reservaRepo.save(reserva);

        Map<String, Object> boleta = buildBoleta(pago);
        if (promoAplicada != null) {
            boleta.put("promoAplicada", promoAplicada);
            boleta.put("descuento", descuento);
            boleta.put("precioOriginal", precioBase);
        }

        return ResponseEntity.ok(ApiResponse.ok("Pago procesado exitosamente", boleta));
    }

    private BigDecimal calcularPrecioBase(Reserva reserva) {
        var detalles = detalleReservaRepo.findByReservaIdReserva(reserva.getIdReserva());
        if (detalles != null && !detalles.isEmpty()) {
            return detalles.stream()
                .map(d -> d.getSubtotal() != null ? d.getSubtotal() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        }
        return BigDecimal.ZERO;
    }

    private Map<String, Object> buildBoleta(Pago pago) {
        Map<String, Object> b = new HashMap<>();
        String numeroBoleta = "BOL-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMM"))
            + "-" + String.format("%04d", pago.getIdPago());
        b.put("numeroBoleta",  numeroBoleta);
        b.put("idPago",        pago.getIdPago());
        b.put("fecha",         pago.getFechaPago() != null ? pago.getFechaPago().toString() : LocalDate.now().toString());
        b.put("montoTotal",    pago.getMontoTotal());
        b.put("metodoPago",    pago.getMetodoPago() != null ? pago.getMetodoPago().name() : "Simulado");
        b.put("estado",        pago.getEstado() != null ? pago.getEstado().name() : "Pagado");
        b.put("referencia",    pago.getReferencia());

        if (pago.getReserva() != null) {
            Reserva r = pago.getReserva();
            b.put("idReserva",   r.getIdReserva());
            b.put("fechaReserva", r.getFechaReserva() != null ? r.getFechaReserva().toString() : "");
            b.put("local",       r.getLocal() != null ? r.getLocal() : "");

            if (r.getCliente() != null && r.getCliente().getUsuario() != null) {
                var u = r.getCliente().getUsuario();
                b.put("cliente", u.getNombres() + " " + u.getApellidos());
            }
            if (r.getHorario() != null) {
                b.put("hora", r.getHorario().getHoraInicio().toString().substring(0, 5));
            }

            var detalles = detalleReservaRepo.findByReservaIdReserva(r.getIdReserva());
            if (detalles != null && !detalles.isEmpty()) {
                var d = detalles.get(0);
                if (d.getServicio() != null) {
                    b.put("servicio", d.getServicio().getNombre());
                }
            }
        }
        return b;
    }

    @Data
    public static class ProcesarPagoRequest {
        private Integer idReserva;
        private String  metodoPago;
        private String  codigoPromocion;
        private String  ultimosDigitosTarjeta;
    }
}

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
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ventas")
@RequiredArgsConstructor
public class VentaController {

    private final VentaRepository        repository;
    private final ClienteRepository      clienteRepo;
    private final UsuarioRepository      usuarioRepo;
    private final ProductoRepository     productoRepo;
    private final DetalleVentaRepository detalleRepo;

    private static final BigDecimal COSTO_DELIVERY = new BigDecimal("5.00");

    @GetMapping
    public ResponseEntity<ApiResponse<List<Venta>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(repository.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Venta>> getById(@PathVariable Integer id) {
        return repository.findById(id)
            .map(e -> ResponseEntity.ok(ApiResponse.ok(e)))
            .orElse(ResponseEntity.notFound().build());
    }

    @Transactional(readOnly = true)
    @GetMapping("/mis-compras")
    public ResponseEntity<ApiResponse<List<VentaResumen>>> misCompras() {
        String correo = SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioRepo.findByCorreo(correo)
            .flatMap(u -> clienteRepo.findByUsuarioIdUsuario(u.getIdUsuario()))
            .map(cliente -> {
                List<VentaResumen> resumen = repository
                    .findByClienteIdClienteOrderByFechaVentaDesc(cliente.getIdCliente())
                    .stream()
                    .map(this::toResumen)
                    .collect(Collectors.toList());
                return ResponseEntity.ok(ApiResponse.ok(resumen));
            })
            .orElse(ResponseEntity.ok(ApiResponse.ok(List.of())));
    }

    @Transactional(readOnly = true)
    @GetMapping("/{id}/detalles")
    public ResponseEntity<ApiResponse<List<DetalleVenta>>> getDetalles(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok(detalleRepo.findByVentaIdVenta(id)));
    }

    @Transactional
    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse<VentaResumen>> checkout(@RequestBody CheckoutRequest req) {
        String correo = SecurityContextHolder.getContext().getAuthentication().getName();
        Cliente cliente = usuarioRepo.findByCorreo(correo)
            .flatMap(u -> clienteRepo.findByUsuarioIdUsuario(u.getIdUsuario()))
            .orElse(null);

        BigDecimal subtotal = req.getItems().stream()
            .map(item -> productoRepo.findById(item.getIdProducto())
                .map(p -> p.getPrecioVenta().multiply(BigDecimal.valueOf(item.getCantidad())))
                .orElse(BigDecimal.ZERO))
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        boolean esDelivery = "Delivery".equalsIgnoreCase(req.getMetodoEntrega());
        BigDecimal costoDelivery = esDelivery ? COSTO_DELIVERY : BigDecimal.ZERO;
        BigDecimal total = subtotal.add(costoDelivery);

        Venta venta = Venta.builder()
            .cliente(cliente)
            .fechaVenta(LocalDateTime.now())
            .total(total)
            .estado(Venta.EstadoVenta.Completado)
            .metodoEntrega(esDelivery ? Venta.MetodoEntrega.Delivery : Venta.MetodoEntrega.RecojoEnLocal)
            .direccionEntrega(req.getDireccionEntrega())
            .sucursalEntrega(req.getSucursalEntrega())
            .costoDelivery(costoDelivery)
            .estadoEntrega(Venta.EstadoEntrega.Pendiente)
            .build();
        repository.save(venta);

        List<DetalleItem> detallesResponse = req.getItems().stream()
            .flatMap(item -> productoRepo.findById(item.getIdProducto()).stream().map(producto -> {
                DetalleVenta detalle = DetalleVenta.builder()
                    .venta(venta)
                    .producto(producto)
                    .cantidad(item.getCantidad())
                    .precioUnitario(producto.getPrecioVenta())
                    .subtotal(producto.getPrecioVenta().multiply(BigDecimal.valueOf(item.getCantidad())))
                    .build();
                detalleRepo.save(detalle);
                return new DetalleItem(producto.getNombre(), item.getCantidad(), producto.getPrecioVenta(), detalle.getSubtotal());
            }))
            .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok("Compra realizada con éxito", toResumenFull(venta, detallesResponse)));
    }

    @Transactional
    @PatchMapping("/{id}/estado-entrega")
    public ResponseEntity<ApiResponse<Void>> cambiarEstadoEntrega(
            @PathVariable Integer id,
            @RequestBody Map<String, String> body) {
        return repository.findById(id).map(v -> {
            String nuevoEstado = body.get("estadoEntrega");
            try {
                v.setEstadoEntrega(Venta.EstadoEntrega.valueOf(nuevoEstado));
                repository.save(v);
                return ResponseEntity.ok(ApiResponse.<Void>ok("Estado de entrega actualizado", null));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().<ApiResponse<Void>>body(ApiResponse.error("Estado inválido: " + nuevoEstado));
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Venta>> create(@RequestBody Venta entity) {
        return ResponseEntity.ok(ApiResponse.ok("Creado exitosamente", repository.save(entity)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Venta>> update(@PathVariable Integer id, @RequestBody Venta entity) {
        if (!repository.existsById(id)) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(ApiResponse.ok("Actualizado", repository.save(entity)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
        if (!repository.existsById(id)) return ResponseEntity.notFound().build();
        repository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok("Eliminado", null));
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private VentaResumen toResumen(Venta v) {
        List<DetalleItem> detalles = detalleRepo.findByVentaIdVenta(v.getIdVenta())
            .stream()
            .map(d -> new DetalleItem(d.getProducto().getNombre(), d.getCantidad(), d.getPrecioUnitario(), d.getSubtotal()))
            .collect(Collectors.toList());
        return toResumenFull(v, detalles);
    }

    private VentaResumen toResumenFull(Venta v, List<DetalleItem> detalles) {
        String nombreCliente = null;
        if (v.getCliente() != null && v.getCliente().getUsuario() != null) {
            var u = v.getCliente().getUsuario();
            nombreCliente = u.getNombres() + " " + u.getApellidos();
        }
        return new VentaResumen(
            v.getIdVenta(), v.getFechaVenta(), v.getTotal(), v.getEstado().name(),
            v.getMetodoEntrega() != null ? v.getMetodoEntrega().name() : "RecojoEnLocal",
            v.getDireccionEntrega(), v.getSucursalEntrega(),
            v.getCostoDelivery() != null ? v.getCostoDelivery() : BigDecimal.ZERO,
            v.getEstadoEntrega() != null ? v.getEstadoEntrega().name() : "Pendiente",
            nombreCliente, detalles
        );
    }

    // ── DTOs ──────────────────────────────────────────────────────────────────

    @Data
    public static class CheckoutRequest {
        private List<Item> items;
        private String metodoEntrega;
        private String direccionEntrega;
        private String sucursalEntrega;

        @Data
        public static class Item {
            private Integer idProducto;
            private Integer cantidad;
        }
    }

    @Data
    public static class VentaResumen {
        private final Integer       idVenta;
        private final LocalDateTime fechaVenta;
        private final BigDecimal    total;
        private final String        estado;
        private final String        metodoEntrega;
        private final String        direccionEntrega;
        private final String        sucursalEntrega;
        private final BigDecimal    costoDelivery;
        private final String        estadoEntrega;
        private final String        nombreCliente;
        private final List<DetalleItem> detalles;
    }

    @Data
    public static class DetalleItem {
        private final String     nombreProducto;
        private final Integer    cantidad;
        private final BigDecimal precioUnitario;
        private final BigDecimal subtotal;
    }
}

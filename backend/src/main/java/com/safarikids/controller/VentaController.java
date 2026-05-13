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
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ventas")
@RequiredArgsConstructor
public class VentaController {

    private final VentaRepository repository;
    private final ClienteRepository clienteRepo;
    private final UsuarioRepository usuarioRepo;
    private final ProductoRepository productoRepo;
    private final DetalleVentaRepository detalleRepo;

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
                    .map(v -> {
                        List<DetalleItem> detalles = detalleRepo.findByVentaIdVenta(v.getIdVenta())
                            .stream()
                            .map(d -> new DetalleItem(
                                d.getProducto().getNombre(),
                                d.getCantidad(),
                                d.getPrecioUnitario(),
                                d.getSubtotal()
                            ))
                            .collect(Collectors.toList());
                        return new VentaResumen(v.getIdVenta(), v.getFechaVenta(), v.getTotal(), v.getEstado().name(), detalles);
                    })
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

        BigDecimal total = req.getItems().stream()
            .map(item -> productoRepo.findById(item.getIdProducto())
                .map(p -> p.getPrecioVenta().multiply(BigDecimal.valueOf(item.getCantidad())))
                .orElse(BigDecimal.ZERO))
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        Venta venta = Venta.builder()
            .cliente(cliente)
            .fechaVenta(LocalDateTime.now())
            .total(total)
            .estado(Venta.EstadoVenta.Completado)
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

        VentaResumen resumen = new VentaResumen(
            venta.getIdVenta(), venta.getFechaVenta(), venta.getTotal(), venta.getEstado().name(), detallesResponse);
        return ResponseEntity.ok(ApiResponse.ok("Compra realizada con éxito", resumen));
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

    // ── DTOs ──────────────────────────────────────────────────────────────────

    @Data
    public static class CheckoutRequest {
        private List<Item> items;

        @Data
        public static class Item {
            private Integer idProducto;
            private Integer cantidad;
        }
    }

    @Data
    public static class VentaResumen {
        private final Integer idVenta;
        private final LocalDateTime fechaVenta;
        private final BigDecimal total;
        private final String estado;
        private final List<DetalleItem> detalles;
    }

    @Data
    public static class DetalleItem {
        private final String nombreProducto;
        private final Integer cantidad;
        private final BigDecimal precioUnitario;
        private final BigDecimal subtotal;
    }
}

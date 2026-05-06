package com.safarikids.controller;

import com.safarikids.dto.ApiResponse;
import com.safarikids.model.*;
import com.safarikids.repository.*;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

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

    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse<Integer>> checkout(@RequestBody CheckoutRequest req) {
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

        for (CheckoutRequest.Item item : req.getItems()) {
            productoRepo.findById(item.getIdProducto()).ifPresent(producto -> {
                DetalleVenta detalle = DetalleVenta.builder()
                    .venta(venta)
                    .producto(producto)
                    .cantidad(item.getCantidad())
                    .precioUnitario(producto.getPrecioVenta())
                    .subtotal(producto.getPrecioVenta().multiply(BigDecimal.valueOf(item.getCantidad())))
                    .build();
                detalleRepo.save(detalle);
            });
        }

        return ResponseEntity.ok(ApiResponse.ok("Compra realizada con éxito", venta.getIdVenta()));
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

    @Data
    public static class CheckoutRequest {
        private List<Item> items;

        @Data
        public static class Item {
            private Integer idProducto;
            private Integer cantidad;
        }
    }
}

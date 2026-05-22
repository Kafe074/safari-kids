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
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/compras")
@RequiredArgsConstructor
public class CompraController {

    private final CompraRepository        repository;
    private final ProveedorRepository     proveedorRepo;
    private final ProductoRepository      productoRepo;
    private final DetalleCompraRepository detalleRepo;
    private final InventarioRepository    inventarioRepo;

    @Transactional(readOnly = true)
    @GetMapping
    public ResponseEntity<ApiResponse<List<Compra>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(repository.findAll()));
    }

    @Transactional(readOnly = true)
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Compra>> getById(@PathVariable Integer id) {
        return repository.findById(id)
            .map(e -> ResponseEntity.ok(ApiResponse.ok(e)))
            .orElse(ResponseEntity.notFound().build());
    }

    @Transactional
    @PostMapping
    public ResponseEntity<ApiResponse<Integer>> create(@RequestBody CompraRequest req) {
        Proveedor prov = proveedorRepo.getReferenceById(req.getIdProveedor());

        BigDecimal total = req.getItems() == null ? BigDecimal.ZERO :
            req.getItems().stream()
                .map(i -> i.getCostoUnitario().multiply(BigDecimal.valueOf(i.getCantidad())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Compra compra = Compra.builder()
            .proveedor(prov)
            .total(total)
            .fechaCompra(LocalDateTime.now())
            .build();
        repository.save(compra);

        if (req.getItems() != null) {
            for (CompraRequest.Item item : req.getItems()) {
                Producto prod = productoRepo.getReferenceById(item.getIdProducto());
                detalleRepo.save(DetalleCompra.builder()
                    .compra(compra)
                    .producto(prod)
                    .cantidad(item.getCantidad())
                    .costoUnitario(item.getCostoUnitario())
                    .subtotal(item.getCostoUnitario().multiply(BigDecimal.valueOf(item.getCantidad())))
                    .build());
                inventarioRepo.findByProductoIdProducto(item.getIdProducto()).ifPresent(inv -> {
                    inv.setStockActual(inv.getStockActual() + item.getCantidad());
                    inventarioRepo.save(inv);
                });
            }
        }
        return ResponseEntity.ok(ApiResponse.ok("Compra registrada", compra.getIdCompra()));
    }

    @Transactional
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
        if (!repository.existsById(id)) return ResponseEntity.notFound().build();
        detalleRepo.deleteByCompraIdCompra(id);
        repository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok("Eliminado", null));
    }

    @Data
    public static class CompraRequest {
        private Integer    idProveedor;
        private List<Item> items;

        @Data
        public static class Item {
            private Integer    idProducto;
            private Integer    cantidad;
            private BigDecimal costoUnitario;
        }
    }
}

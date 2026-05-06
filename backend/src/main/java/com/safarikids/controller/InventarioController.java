package com.safarikids.controller;

import com.safarikids.dto.ApiResponse;
import com.safarikids.model.Inventario;
import com.safarikids.model.Producto;
import com.safarikids.repository.InventarioRepository;
import com.safarikids.repository.ProductoRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/inventarios")
@RequiredArgsConstructor
public class InventarioController {

    private final InventarioRepository repository;
    private final ProductoRepository productoRepo;

    @Transactional(readOnly = true)
    @GetMapping
    public ResponseEntity<ApiResponse<List<Inventario>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(repository.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Inventario>> getById(@PathVariable Integer id) {
        return repository.findById(id)
            .map(e -> ResponseEntity.ok(ApiResponse.ok(e)))
            .orElse(ResponseEntity.notFound().build());
    }

    /** Create inventory entry for a product. Body: { idProducto, stockActual, stockMinimo, ubicacion } */
    @PostMapping
    public ResponseEntity<ApiResponse<Integer>> create(@RequestBody InventarioRequest req) {
        Producto prod = productoRepo.getReferenceById(req.getIdProducto());
        Inventario inv = Inventario.builder()
            .producto(prod)
            .stockActual(req.getStockActual() != null ? req.getStockActual() : 0)
            .stockMinimo(req.getStockMinimo() != null ? req.getStockMinimo() : 5)
            .ubicacion(req.getUbicacion() != null ? req.getUbicacion() : "Estante A")
            .build();
        return ResponseEntity.ok(ApiResponse.ok("Creado", repository.save(inv).getIdInventario()));
    }

    /** Update stock quantity only */
    @PatchMapping("/{id}/stock")
    public ResponseEntity<ApiResponse<Integer>> patchStock(@PathVariable Integer id, @RequestBody StockPatch body) {
        return repository.findById(id).map(inv -> {
            inv.setStockActual(body.getStockActual());
            return ResponseEntity.ok(ApiResponse.ok("Stock actualizado", repository.save(inv).getIdInventario()));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
        if (!repository.existsById(id)) return ResponseEntity.notFound().build();
        repository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok("Eliminado", null));
    }

    @Data public static class InventarioRequest {
        private Integer idProducto;
        private Integer stockActual;
        private Integer stockMinimo;
        private String  ubicacion;
    }

    @Data public static class StockPatch {
        private Integer stockActual;
    }
}

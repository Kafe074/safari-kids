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
    private final ProductoRepository   productoRepo;

    @Transactional(readOnly = true)
    @GetMapping
    public ResponseEntity<ApiResponse<List<Inventario>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(repository.findAll()));
    }

    @Transactional(readOnly = true)
    @GetMapping("/sucursal/{sucursal}")
    public ResponseEntity<ApiResponse<List<Inventario>>> getBySucursal(@PathVariable String sucursal) {
        return ResponseEntity.ok(ApiResponse.ok(repository.findBySucursal(sucursal)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Inventario>> getById(@PathVariable Integer id) {
        return repository.findById(id)
            .map(e -> ResponseEntity.ok(ApiResponse.ok(e)))
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Integer>> create(@RequestBody InventarioRequest req) {
        Producto prod = productoRepo.getReferenceById(req.getIdProducto());
        Inventario inv = Inventario.builder()
            .producto(prod)
            .stockActual(req.getStockActual() != null ? req.getStockActual() : 0)
            .stockMinimo(req.getStockMinimo() != null ? req.getStockMinimo() : 5)
            .ubicacion(req.getUbicacion() != null ? req.getUbicacion() : "")
            .sucursal(req.getSucursal())
            .build();
        return ResponseEntity.ok(ApiResponse.ok("Creado", repository.save(inv).getIdInventario()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Inventario>> update(@PathVariable Integer id, @RequestBody InventarioRequest req) {
        return repository.findById(id).map(inv -> {
            if (req.getStockActual() != null) inv.setStockActual(req.getStockActual());
            if (req.getStockMinimo() != null) inv.setStockMinimo(req.getStockMinimo());
            if (req.getUbicacion()  != null) inv.setUbicacion(req.getUbicacion());
            if (req.getSucursal()   != null) inv.setSucursal(req.getSucursal());
            return ResponseEntity.ok(ApiResponse.ok("Actualizado", repository.save(inv)));
        }).orElse(ResponseEntity.notFound().build());
    }

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
        private String  sucursal;
    }

    @Data public static class StockPatch {
        private Integer stockActual;
    }
}

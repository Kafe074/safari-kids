package com.safarikids.controller;

import com.safarikids.dto.ApiResponse;
import com.safarikids.model.Promocion;
import com.safarikids.repository.PromocionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/promocions")
@RequiredArgsConstructor
public class PromocionController {

    private final PromocionRepository repository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Promocion>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(repository.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Promocion>> getById(@PathVariable Integer id) {
        return repository.findById(id)
            .map(e -> ResponseEntity.ok(ApiResponse.ok(e)))
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Promocion>> create(@RequestBody Promocion entity) {
        return ResponseEntity.ok(ApiResponse.ok("Creado exitosamente", repository.save(entity)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Promocion>> update(@PathVariable Integer id, @RequestBody Promocion entity) {
        if (!repository.existsById(id)) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(ApiResponse.ok("Actualizado", repository.save(entity)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
        if (!repository.existsById(id)) return ResponseEntity.notFound().build();
        repository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok("Eliminado", null));
    }
}

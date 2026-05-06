package com.safarikids.controller;

import com.safarikids.dto.ApiResponse;
import com.safarikids.model.Servicio;
import com.safarikids.repository.ServicioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/servicios")
@RequiredArgsConstructor
public class ServicioController {

    private final ServicioRepository repository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Servicio>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(repository.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Servicio>> getById(@PathVariable Integer id) {
        return repository.findById(id)
            .map(e -> ResponseEntity.ok(ApiResponse.ok(e)))
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Servicio>> create(@RequestBody Servicio entity) {
        return ResponseEntity.ok(ApiResponse.ok("Creado exitosamente", repository.save(entity)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Servicio>> update(@PathVariable Integer id, @RequestBody Servicio entity) {
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

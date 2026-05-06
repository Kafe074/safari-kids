package com.safarikids.controller;

import com.safarikids.dto.ApiResponse;
import com.safarikids.model.Horario;
import com.safarikids.repository.HorarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/horarios")
@RequiredArgsConstructor
public class HorarioController {

    private final HorarioRepository repository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Horario>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(repository.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Horario>> getById(@PathVariable Integer id) {
        return repository.findById(id)
            .map(e -> ResponseEntity.ok(ApiResponse.ok(e)))
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Horario>> create(@RequestBody Horario entity) {
        return ResponseEntity.ok(ApiResponse.ok("Creado exitosamente", repository.save(entity)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Horario>> update(@PathVariable Integer id, @RequestBody Horario entity) {
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

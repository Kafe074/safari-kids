package com.safarikids.controller;

import com.safarikids.dto.ApiResponse;
import com.safarikids.model.Promocion;
import com.safarikids.repository.PromocionRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/promociones")
@RequiredArgsConstructor
public class PromocionController {

    private final PromocionRepository repository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Promocion>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(repository.findAll()));
    }

    @GetMapping("/activas")
    public ResponseEntity<ApiResponse<List<Promocion>>> getActivas() {
        return ResponseEntity.ok(ApiResponse.ok(repository.findByEstado(Promocion.EstadoPromocion.Activa)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Promocion>> getById(@PathVariable Integer id) {
        return repository.findById(id)
            .map(e -> ResponseEntity.ok(ApiResponse.ok(e)))
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/validar-codigo")
    public ResponseEntity<ApiResponse<Map<String, Object>>> validarCodigo(@RequestBody ValidarCodigoRequest req) {
        return repository.findByCodigo(req.getCodigo())
            .filter(p -> p.getEstado() == Promocion.EstadoPromocion.Activa)
            .filter(p -> {
                LocalDate hoy = LocalDate.now();
                boolean inicioOk = p.getFechaInicio() == null || !hoy.isBefore(p.getFechaInicio());
                boolean finOk    = p.getFechaFin()    == null || !hoy.isAfter(p.getFechaFin());
                return inicioOk && finOk;
            })
            .map(p -> {
                Map<String, Object> result = new HashMap<>();
                result.put("valido",    true);
                result.put("nombre",    p.getNombre());
                result.put("descuento", p.getDescuento());
                result.put("tipo",      p.getTipo().name());
                return ResponseEntity.ok(ApiResponse.ok("Código válido", result));
            })
            .orElseGet(() -> {
                Map<String, Object> result = new HashMap<>();
                result.put("valido", false);
                return ResponseEntity.ok(ApiResponse.ok("Código no válido", result));
            });
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Promocion>> create(@RequestBody Promocion entity) {
        return ResponseEntity.ok(ApiResponse.ok("Creado exitosamente", repository.save(entity)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Promocion>> update(@PathVariable Integer id, @RequestBody Promocion entity) {
        if (!repository.existsById(id)) return ResponseEntity.notFound().build();
        entity.setIdPromocion(id);
        return ResponseEntity.ok(ApiResponse.ok("Actualizado", repository.save(entity)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
        if (!repository.existsById(id)) return ResponseEntity.notFound().build();
        repository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok("Eliminado", null));
    }

    @Data
    public static class ValidarCodigoRequest {
        private String codigo;
    }
}

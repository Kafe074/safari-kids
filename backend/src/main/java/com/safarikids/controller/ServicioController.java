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
import java.util.List;

@RestController
@RequestMapping("/api/servicios")
@RequiredArgsConstructor
public class ServicioController {

    private final ServicioRepository repository;
    private final ServicioInsumoRepository servicioInsumoRepo;
    private final InsumoRepository insumoRepo;

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

    /* ── Insumos por servicio ─────────────────────────────────── */

    @GetMapping("/{id}/insumos")
    public ResponseEntity<ApiResponse<List<ServicioInsumo>>> getInsumos(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok(servicioInsumoRepo.findByServicioIdServicio(id)));
    }

    @Transactional
    @PostMapping("/{id}/insumos")
    public ResponseEntity<ApiResponse<ServicioInsumo>> addInsumo(
            @PathVariable Integer id,
            @RequestBody InsumoRequest req) {

        Servicio servicio = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Servicio no encontrado"));
        Insumo insumo = insumoRepo.findById(req.getIdInsumo())
            .orElseThrow(() -> new RuntimeException("Insumo no encontrado"));

        if (servicioInsumoRepo.existsByServicioIdServicioAndInsumoIdInsumo(id, req.getIdInsumo())) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("El insumo ya está asignado a este servicio"));
        }

        ServicioInsumo si = ServicioInsumo.builder()
            .servicio(servicio)
            .insumo(insumo)
            .cantidad(req.getCantidad())
            .build();
        return ResponseEntity.ok(ApiResponse.ok("Insumo asignado", servicioInsumoRepo.save(si)));
    }

    @Transactional
    @PutMapping("/{id}/insumos/{idInsumo}")
    public ResponseEntity<ApiResponse<ServicioInsumo>> updateInsumo(
            @PathVariable Integer id,
            @PathVariable Integer idInsumo,
            @RequestBody InsumoRequest req) {

        return servicioInsumoRepo.findByServicioIdServicio(id).stream()
            .filter(si -> si.getInsumo().getIdInsumo().equals(idInsumo))
            .findFirst()
            .map(si -> {
                si.setCantidad(req.getCantidad());
                return ResponseEntity.ok(ApiResponse.ok("Actualizado", servicioInsumoRepo.save(si)));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @Transactional
    @DeleteMapping("/{id}/insumos/{idInsumo}")
    public ResponseEntity<ApiResponse<Void>> removeInsumo(
            @PathVariable Integer id,
            @PathVariable Integer idInsumo) {

        if (!servicioInsumoRepo.existsByServicioIdServicioAndInsumoIdInsumo(id, idInsumo)) {
            return ResponseEntity.notFound().build();
        }
        servicioInsumoRepo.deleteByServicioIdServicioAndInsumoIdInsumo(id, idInsumo);
        return ResponseEntity.ok(ApiResponse.ok("Insumo removido", null));
    }

    @Data
    public static class InsumoRequest {
        private Integer idInsumo;
        private BigDecimal cantidad;
    }
}

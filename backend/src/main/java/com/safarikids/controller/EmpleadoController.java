package com.safarikids.controller;

import com.safarikids.dto.ApiResponse;
import com.safarikids.model.Empleado;
import com.safarikids.repository.EmpleadoRepository;
import com.safarikids.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/empleados")
@RequiredArgsConstructor
public class EmpleadoController {

    private final EmpleadoRepository repository;
    private final UsuarioRepository usuarioRepo;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Empleado>> me() {
        String correo = SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioRepo.findByCorreo(correo)
            .flatMap(u -> repository.findByUsuarioIdUsuario(u.getIdUsuario()))
            .map(e -> ResponseEntity.ok(ApiResponse.ok(e)))
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Empleado>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(repository.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Empleado>> getById(@PathVariable Integer id) {
        return repository.findById(id).map(e -> ResponseEntity.ok(ApiResponse.ok(e)))
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Empleado>> create(@RequestBody Empleado empleado) {
        return ResponseEntity.ok(ApiResponse.ok("Empleado creado", repository.save(empleado)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Empleado>> update(@PathVariable Integer id, @RequestBody Empleado empleado) {
        return repository.findById(id).map(existing -> {
            existing.setEspecialidad(empleado.getEspecialidad());
            existing.setSucursal(empleado.getSucursal());
            existing.setTurno(empleado.getTurno());
            existing.setEstado(empleado.getEstado());
            return ResponseEntity.ok(ApiResponse.ok("Actualizado", repository.save(existing)));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
        repository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok("Eliminado", null));
    }
}

package com.safarikids.controller;

import com.safarikids.dto.ApiResponse;
import com.safarikids.model.Cliente;
import com.safarikids.repository.ClienteRepository;
import com.safarikids.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/clientes")
@RequiredArgsConstructor
public class ClienteController {

    private final ClienteRepository repository;
    private final UsuarioRepository usuarioRepo;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Cliente>> me() {
        String correo = SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioRepo.findByCorreo(correo)
            .flatMap(u -> repository.findByUsuarioIdUsuario(u.getIdUsuario()))
            .map(c -> ResponseEntity.ok(ApiResponse.ok(c)))
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Cliente>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(repository.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Cliente>> getById(@PathVariable Integer id) {
        return repository.findById(id).map(c -> ResponseEntity.ok(ApiResponse.ok(c)))
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Cliente>> create(@RequestBody Cliente cliente) {
        return ResponseEntity.ok(ApiResponse.ok("Cliente creado", repository.save(cliente)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Cliente>> update(@PathVariable Integer id, @RequestBody Cliente cliente) {
        if (!repository.existsById(id)) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(ApiResponse.ok("Actualizado", repository.save(cliente)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
        repository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok("Eliminado", null));
    }
}

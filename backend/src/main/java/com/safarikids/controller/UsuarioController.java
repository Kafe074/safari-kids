package com.safarikids.controller;

import com.safarikids.dto.ApiResponse;
import com.safarikids.model.Usuario;
import com.safarikids.repository.UsuarioRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final com.safarikids.service.EmailService emailService;

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<List<Usuario>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(repository.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Usuario>> getById(@PathVariable Integer id) {
        return repository.findById(id)
            .map(u -> ResponseEntity.ok(ApiResponse.ok(u)))
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Usuario>> create(@RequestBody Usuario usuario) {
        if (repository.existsByCorreo(usuario.getCorreo()))
            return ResponseEntity.badRequest().body(ApiResponse.error("El correo ya está registrado"));
        usuario.setContrasena(passwordEncoder.encode(usuario.getContrasena()));
        usuario.setFechaRegistro(LocalDate.now());
        return ResponseEntity.ok(ApiResponse.ok("Usuario creado", repository.save(usuario)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Usuario>> update(@PathVariable Integer id, @RequestBody Usuario usuario) {
        if (!repository.existsById(id)) return ResponseEntity.notFound().build();
        if (usuario.getContrasena() != null && !usuario.getContrasena().isBlank())
            usuario.setContrasena(passwordEncoder.encode(usuario.getContrasena()));
        return ResponseEntity.ok(ApiResponse.ok("Actualizado", repository.save(usuario)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
        repository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok("Eliminado", null));
    }

    @PutMapping("/cambiar-password")
    public ResponseEntity<ApiResponse<Void>> cambiarPassword(@Valid @RequestBody CambiarPasswordRequest req) {
        String correo = SecurityContextHolder.getContext().getAuthentication().getName();
        return repository.findByCorreo(correo).map(u -> {
            if (!passwordEncoder.matches(req.getActual(), u.getContrasena()))
                return ResponseEntity.badRequest().<ApiResponse<Void>>body(ApiResponse.error("Contraseña actual incorrecta"));
            u.setContrasena(passwordEncoder.encode(req.getNueva()));
            repository.save(u);
            emailService.enviarCambioPassword(u.getCorreo(), u.getNombres());
            return ResponseEntity.ok(ApiResponse.<Void>ok("Contraseña actualizada", null));
        }).orElse(ResponseEntity.notFound().build());
    }

    @Data
    public static class CambiarPasswordRequest {
        @NotBlank(message = "La contraseña actual es obligatoria")
        private String actual;
        @NotBlank(message = "La nueva contraseña es obligatoria")
        @Size(min = 6, message = "La nueva contraseña debe tener al menos 6 caracteres")
        private String nueva;
    }
}

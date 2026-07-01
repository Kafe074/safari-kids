package com.safarikids.controller;

import com.safarikids.dto.ApiResponse;
import com.safarikids.dto.EmpleadoRequest;
import com.safarikids.model.Empleado;
import com.safarikids.model.Rol;
import com.safarikids.model.Usuario;
import com.safarikids.repository.EmpleadoRepository;
import com.safarikids.repository.RolRepository;
import com.safarikids.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/empleados")
@RequiredArgsConstructor
public class EmpleadoController {

    private final EmpleadoRepository repository;
    private final UsuarioRepository usuarioRepo;
    private final RolRepository rolRepo;
    private final PasswordEncoder passwordEncoder;

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

    /** Estilistas activos de una sede, para que el cliente elija al reservar. */
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    @GetMapping("/disponibles")
    public ResponseEntity<ApiResponse<List<Empleado>>> disponibles(
            @RequestParam(required = false) String sucursal) {
        List<Empleado> activos = (sucursal != null && !sucursal.isBlank())
            ? repository.findBySucursalAndEstado(sucursal, Empleado.EstadoEmpleado.Activo)
            : repository.findByEstado(Empleado.EstadoEmpleado.Activo);
        return ResponseEntity.ok(ApiResponse.ok(activos));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Empleado>> getById(@PathVariable Integer id) {
        return repository.findById(id).map(e -> ResponseEntity.ok(ApiResponse.ok(e)))
            .orElse(ResponseEntity.notFound().build());
    }

    /** Crea el Usuario (login, rol "Empleado") + el registro Empleado en una sola transacción. */
    @Transactional
    @PostMapping
    public ResponseEntity<ApiResponse<Empleado>> create(@RequestBody EmpleadoRequest req) {
        if (req.getNombres() == null || req.getNombres().isBlank()
                || req.getApellidos() == null || req.getApellidos().isBlank())
            return ResponseEntity.badRequest().body(ApiResponse.error("Nombres y apellidos son obligatorios"));
        if (req.getCorreo() == null || !req.getCorreo().contains("@"))
            return ResponseEntity.badRequest().body(ApiResponse.error("Correo no válido"));
        if (req.getContrasena() == null || req.getContrasena().length() < 6)
            return ResponseEntity.badRequest().body(ApiResponse.error("La contraseña debe tener al menos 6 caracteres"));

        String correo = req.getCorreo().trim();
        if (usuarioRepo.existsByCorreo(correo))
            return ResponseEntity.badRequest().body(ApiResponse.error("El correo ya está registrado"));

        Rol rolEmpleado = rolRepo.findByNombre("Empleado").orElse(null);
        if (rolEmpleado == null)
            return ResponseEntity.status(500).body(ApiResponse.error("Rol Empleado no encontrado"));

        Usuario usuario = usuarioRepo.save(Usuario.builder()
            .nombres(req.getNombres().trim())
            .apellidos(req.getApellidos().trim())
            .correo(correo)
            .contrasena(passwordEncoder.encode(req.getContrasena()))
            .estado(Usuario.EstadoUsuario.Activo)
            .fechaRegistro(LocalDate.now())
            .rol(rolEmpleado)
            .build());

        Empleado empleado = repository.save(Empleado.builder()
            .usuario(usuario)
            .especialidad(req.getEspecialidad())
            .sucursal(req.getSucursal())
            .turno(req.getTurno())
            .estado(req.getEstado() != null ? req.getEstado() : Empleado.EstadoEmpleado.Activo)
            .build());

        return ResponseEntity.ok(ApiResponse.ok("Empleado creado", empleado));
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

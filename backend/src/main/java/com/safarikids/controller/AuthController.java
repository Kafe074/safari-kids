package com.safarikids.controller;

import com.safarikids.dto.*;
import com.safarikids.model.Cliente;
import com.safarikids.model.Rol;
import com.safarikids.model.Usuario;
import com.safarikids.repository.ClienteRepository;
import com.safarikids.repository.RolRepository;
import com.safarikids.repository.UsuarioRepository;
import com.safarikids.security.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authManager;
    private final UserDetailsServiceImpl userDetailsService;
    private final JwtUtil jwtUtil;
    private final UsuarioRepository usuarioRepo;
    private final RolRepository rolRepo;
    private final ClienteRepository clienteRepo;
    private final PasswordEncoder passwordEncoder;
    private final com.safarikids.service.EmailService emailService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@RequestBody LoginRequest req) {
        try {
            authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getCorreo(), req.getContrasena()));
            UserDetails ud = userDetailsService.loadUserByUsername(req.getCorreo());
            String token = jwtUtil.generateToken(ud);
            Usuario u = usuarioRepo.findByCorreo(req.getCorreo()).orElseThrow();
            LoginResponse resp = new LoginResponse(token, u.getCorreo(),
                u.getNombres() + " " + u.getApellidos(), u.getRol().getNombre());
            return ResponseEntity.ok(ApiResponse.ok("Login exitoso", resp));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body(ApiResponse.error("Credenciales incorrectas"));
        }
    }

    @PostMapping("/verify-password")
    public ResponseEntity<ApiResponse<Boolean>> verifyPassword(@RequestBody Map<String, String> body) {
        String correo = SecurityContextHolder.getContext().getAuthentication().getName();
        if ("anonymousUser".equals(correo)) {
            return ResponseEntity.status(401).body(ApiResponse.error("No autenticado"));
        }
        String rawPassword = body.get("contrasena");
        if (rawPassword == null || rawPassword.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Contraseña requerida"));
        }
        return usuarioRepo.findByCorreo(correo)
            .map(u -> ResponseEntity.ok(ApiResponse.ok(passwordEncoder.matches(rawPassword, u.getContrasena()))))
            .orElse(ResponseEntity.status(404).body(ApiResponse.error("Usuario no encontrado")));
    }

    @org.springframework.transaction.annotation.Transactional
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<LoginResponse>> register(@RequestBody RegisterRequest req) {
        String dni = req.getDni() == null ? null : req.getDni().trim();
        if (dni == null || !dni.matches("\\d{8}"))
            return ResponseEntity.badRequest().body(ApiResponse.error("El DNI debe tener 8 dígitos"));

        java.util.Optional<Rol> rolOpt = rolRepo.findByNombre("Cliente");
        if (rolOpt.isEmpty())
            return ResponseEntity.status(500).body(ApiResponse.error("Rol CLIENTE no encontrado"));
        Rol rolCliente = rolOpt.get();

        // ── Reclamación de cuenta provisional (walk-in) por DNI ───────────────
        java.util.Optional<Cliente> porDni = clienteRepo.findByDni(dni);
        if (porDni.isPresent()) {
            Cliente cliente = porDni.get();
            if (!Boolean.FALSE.equals(cliente.getReclamada()))
                return ResponseEntity.badRequest().body(
                    ApiResponse.error("Este DNI ya tiene una cuenta registrada. Inicia sesión."));

            // Cuenta provisional → vincular con el correo/contraseña reales del cliente
            Usuario usuario = cliente.getUsuario();
            if (!usuario.getCorreo().equals(req.getCorreo()) && usuarioRepo.existsByCorreo(req.getCorreo()))
                return ResponseEntity.badRequest().body(ApiResponse.error("El correo ya está registrado"));

            usuario.setNombres(req.getNombres());
            usuario.setApellidos(req.getApellidos());
            usuario.setCorreo(req.getCorreo());
            usuario.setContrasena(passwordEncoder.encode(req.getContrasena()));
            usuarioRepo.save(usuario);

            if (req.getTelefono() != null)        cliente.setTelefono(req.getTelefono());
            if (req.getDireccion() != null)       cliente.setDireccion(req.getDireccion());
            if (req.getFechaNacimiento() != null) cliente.setFechaNacimiento(req.getFechaNacimiento());
            cliente.setReclamada(true);
            clienteRepo.save(cliente);

            UserDetails ud = userDetailsService.loadUserByUsername(usuario.getCorreo());
            String token = jwtUtil.generateToken(ud);
            LoginResponse resp = new LoginResponse(token, usuario.getCorreo(),
                usuario.getNombres() + " " + usuario.getApellidos(), rolCliente.getNombre());
            emailService.enviarBienvenida(usuario.getCorreo(), usuario.getNombres());
            return ResponseEntity.ok(ApiResponse.ok("¡Cuenta vinculada! Recuperamos tu historial de reservas", resp));
        }

        // ── Registro nuevo ────────────────────────────────────────────────────
        if (usuarioRepo.existsByCorreo(req.getCorreo()))
            return ResponseEntity.badRequest().body(ApiResponse.error("El correo ya está registrado"));

        Usuario usuario = Usuario.builder()
            .nombres(req.getNombres())
            .apellidos(req.getApellidos())
            .correo(req.getCorreo())
            .contrasena(passwordEncoder.encode(req.getContrasena()))
            .estado(Usuario.EstadoUsuario.Activo)
            .fechaRegistro(LocalDate.now())
            .rol(rolCliente)
            .build();
        usuarioRepo.save(usuario);

        Cliente cliente = Cliente.builder()
            .usuario(usuario)
            .dni(dni)
            .reclamada(true)
            .telefono(req.getTelefono())
            .direccion(req.getDireccion())
            .fechaNacimiento(req.getFechaNacimiento())
            .build();
        clienteRepo.save(cliente);

        UserDetails ud = userDetailsService.loadUserByUsername(usuario.getCorreo());
        String token = jwtUtil.generateToken(ud);
        LoginResponse resp = new LoginResponse(token, usuario.getCorreo(),
            usuario.getNombres() + " " + usuario.getApellidos(), rolCliente.getNombre());
        emailService.enviarBienvenida(usuario.getCorreo(), usuario.getNombres());
        return ResponseEntity.ok(ApiResponse.ok("Registro exitoso", resp));
    }
}

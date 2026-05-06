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
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;

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

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<LoginResponse>> register(@RequestBody RegisterRequest req) {
        if (usuarioRepo.existsByCorreo(req.getCorreo()))
            return ResponseEntity.badRequest().body(ApiResponse.error("El correo ya está registrado"));

        java.util.Optional<Rol> rolOpt = rolRepo.findByNombre("CLIENTE");
        if (rolOpt.isEmpty())
            return ResponseEntity.status(500).body(ApiResponse.error("Rol CLIENTE no encontrado"));
        Rol rolCliente = rolOpt.get();

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
            .telefono(req.getTelefono())
            .build();
        clienteRepo.save(cliente);

        UserDetails ud = userDetailsService.loadUserByUsername(usuario.getCorreo());
        String token = jwtUtil.generateToken(ud);
        LoginResponse resp = new LoginResponse(token, usuario.getCorreo(),
            usuario.getNombres() + " " + usuario.getApellidos(), rolCliente.getNombre());
        return ResponseEntity.ok(ApiResponse.ok("Registro exitoso", resp));
    }
}

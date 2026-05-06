package com.safarikids.service.impl;
import com.safarikids.model.Usuario;
import com.safarikids.repository.UsuarioRepository;
import com.safarikids.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
@Service @RequiredArgsConstructor
public class UsuarioServiceImpl implements UsuarioService {
    private final UsuarioRepository repo;
    private final PasswordEncoder encoder;
    public List<Usuario> findAll() { return repo.findAll(); }
    public Usuario findById(Integer id) { return repo.findById(id).orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + id)); }
    public Usuario findByCorreo(String correo) { return repo.findByCorreo(correo).orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + correo)); }
    public boolean existsByCorreo(String correo) { return repo.existsByCorreo(correo); }
    public Usuario save(Usuario u) {
        u.setContrasena(encoder.encode(u.getContrasena()));
        u.setFechaRegistro(LocalDate.now());
        return repo.save(u);
    }
    public Usuario update(Integer id, Usuario u) {
        Usuario existing = findById(id);
        existing.setNombres(u.getNombres());
        existing.setApellidos(u.getApellidos());
        existing.setEstado(u.getEstado());
        existing.setRol(u.getRol());
        if (u.getContrasena() != null && !u.getContrasena().isBlank())
            existing.setContrasena(encoder.encode(u.getContrasena()));
        return repo.save(existing);
    }
    public void delete(Integer id) { repo.deleteById(id); }
}
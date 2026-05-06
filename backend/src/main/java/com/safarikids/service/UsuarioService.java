package com.safarikids.service;
import com.safarikids.model.Usuario;
import java.util.List;
public interface UsuarioService {
    List<Usuario> findAll();
    Usuario findById(Integer id);
    Usuario findByCorreo(String correo);
    Usuario save(Usuario u);
    Usuario update(Integer id, Usuario u);
    void delete(Integer id);
    boolean existsByCorreo(String correo);
}
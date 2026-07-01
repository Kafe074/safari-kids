package com.safarikids.repository;
import com.safarikids.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Integer> {
    Optional<Cliente> findByUsuarioIdUsuario(Integer idUsuario);
    Optional<Cliente> findByDni(String dni);
}

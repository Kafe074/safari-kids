package com.safarikids.repository;
import com.safarikids.model.Rol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface RolRepository extends JpaRepository<Rol, Integer> {
    java.util.Optional<Rol> findByNombre(String nombre);
}

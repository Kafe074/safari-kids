package com.safarikids.repository;
import com.safarikids.model.MovimientoInventario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface MovimientoInventarioRepository extends JpaRepository<MovimientoInventario, Integer> {}

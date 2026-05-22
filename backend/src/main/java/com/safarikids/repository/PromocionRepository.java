package com.safarikids.repository;

import com.safarikids.model.Promocion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PromocionRepository extends JpaRepository<Promocion, Integer> {
    Optional<Promocion> findByCodigo(String codigo);
    List<Promocion> findByEstado(Promocion.EstadoPromocion estado);
    List<Promocion> findByTipoAndEstado(Promocion.TipoPromocion tipo, Promocion.EstadoPromocion estado);
    List<Promocion> findByPrimerServicioTrueAndEstado(Promocion.EstadoPromocion estado);
}

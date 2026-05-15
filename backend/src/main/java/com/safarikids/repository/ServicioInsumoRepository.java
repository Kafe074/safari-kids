package com.safarikids.repository;

import com.safarikids.model.ServicioInsumo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ServicioInsumoRepository extends JpaRepository<ServicioInsumo, Integer> {
    List<ServicioInsumo> findByServicioIdServicio(Integer idServicio);
    void deleteByServicioIdServicioAndInsumoIdInsumo(Integer idServicio, Integer idInsumo);
    boolean existsByServicioIdServicioAndInsumoIdInsumo(Integer idServicio, Integer idInsumo);
}

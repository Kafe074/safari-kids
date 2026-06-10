package com.safarikids.repository;

import com.safarikids.model.SolicitudInsumo;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SolicitudInsumoRepository extends JpaRepository<SolicitudInsumo, Integer> {
    List<SolicitudInsumo> findByEmpleadoIdEmpleadoOrderByFechaSolicitudDesc(Integer idEmpleado);
    List<SolicitudInsumo> findAllByOrderByFechaSolicitudDesc();
}

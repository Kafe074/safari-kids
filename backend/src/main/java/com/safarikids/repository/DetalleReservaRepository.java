package com.safarikids.repository;
import com.safarikids.model.DetalleReserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface DetalleReservaRepository extends JpaRepository<DetalleReserva, Integer> {
    void deleteByReservaIdReserva(Integer idReserva);
}

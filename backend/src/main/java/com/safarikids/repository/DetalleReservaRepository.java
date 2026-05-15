package com.safarikids.repository;
import com.safarikids.model.DetalleReserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface DetalleReservaRepository extends JpaRepository<DetalleReserva, Integer> {
    List<DetalleReserva> findByReservaIdReserva(Integer idReserva);
    void deleteByReservaIdReserva(Integer idReserva);
}

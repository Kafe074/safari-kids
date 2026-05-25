package com.safarikids.repository;
import com.safarikids.model.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Integer> {
    List<Reserva> findByClienteIdCliente(Integer idCliente);
    List<Reserva> findByEmpleadoIdEmpleado(Integer idEmpleado);
    List<Reserva> findByFechaReservaBetween(LocalDate inicio, LocalDate fin);
    List<Reserva> findByFechaReserva(LocalDate fecha);
    long countByClienteIdClienteAndEstado(Integer idCliente, Reserva.EstadoReserva estado);

    Optional<Reserva> findByCodigoReserva(String codigoReserva);

    @Query("SELECT COUNT(r) FROM Reserva r WHERE r.estado = 'Pendiente'")
    long countPendientes();
}

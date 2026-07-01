package com.safarikids.repository;
import com.safarikids.model.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Integer> {

    /** Reservas de una fecha cuyo horario cae en la ventana [desde, hasta) y aún no tienen recordatorio enviado. */
    @Query("SELECT r FROM Reserva r WHERE r.fechaReserva = :fecha " +
           "AND r.horario.horaInicio >= :desde AND r.horario.horaInicio < :hasta " +
           "AND r.estado <> com.safarikids.model.Reserva.EstadoReserva.Cancelado " +
           "AND (r.recordatorioEnviado = false OR r.recordatorioEnviado IS NULL)")
    List<Reserva> findParaRecordatorio(LocalDate fecha, LocalTime desde, LocalTime hasta);
    List<Reserva> findByClienteIdCliente(Integer idCliente);
    List<Reserva> findByEmpleadoIdEmpleado(Integer idEmpleado);
    List<Reserva> findByFechaReservaBetween(LocalDate inicio, LocalDate fin);
    List<Reserva> findByFechaReserva(LocalDate fecha);
    long countByClienteIdClienteAndEstado(Integer idCliente, Reserva.EstadoReserva estado);

    Optional<Reserva> findByCodigoReserva(String codigoReserva);

    @Query("SELECT COUNT(r) FROM Reserva r WHERE r.estado = 'Pendiente'")
    long countPendientes();
}

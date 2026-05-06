package com.safarikids.service;
import com.safarikids.model.Reserva;
import java.time.LocalDate;
import java.util.List;
public interface ReservaService {
    List<Reserva> findAll();
    List<Reserva> findByCliente(Integer idCliente);
    List<Reserva> findByRango(LocalDate inicio, LocalDate fin);
    Reserva findById(Integer id);
    Reserva save(Reserva r);
    Reserva updateEstado(Integer id, Reserva.EstadoReserva estado);
    void delete(Integer id);
    long countPendientes();
    long countHoy();
}
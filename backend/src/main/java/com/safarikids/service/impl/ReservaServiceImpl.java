package com.safarikids.service.impl;
import com.safarikids.model.Reserva;
import com.safarikids.repository.ReservaRepository;
import com.safarikids.service.ReservaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
@Service @RequiredArgsConstructor
public class ReservaServiceImpl implements ReservaService {
    private final ReservaRepository repo;
    public List<Reserva> findAll() { return repo.findAll(); }
    public List<Reserva> findByCliente(Integer id) { return repo.findByClienteIdCliente(id); }
    public List<Reserva> findByRango(LocalDate ini, LocalDate fin) { return repo.findByFechaReservaBetween(ini, fin); }
    public Reserva findById(Integer id) { return repo.findById(id).orElseThrow(() -> new RuntimeException("Reserva no encontrada: " + id)); }
    public Reserva save(Reserva r) { return repo.save(r); }
    public Reserva updateEstado(Integer id, Reserva.EstadoReserva estado) {
        Reserva r = findById(id); r.setEstado(estado); return repo.save(r);
    }
    public void delete(Integer id) { repo.deleteById(id); }
    public long countPendientes() { return repo.countPendientes(); }
    public long countHoy() { return repo.findByFechaReservaBetween(LocalDate.now(), LocalDate.now()).size(); }
}
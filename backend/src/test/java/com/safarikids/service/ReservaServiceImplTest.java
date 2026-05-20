package com.safarikids.service;

import com.safarikids.model.Reserva;
import com.safarikids.repository.ReservaRepository;
import com.safarikids.service.impl.ReservaServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReservaServiceImplTest {

    @Mock
    private ReservaRepository repo;

    @InjectMocks
    private ReservaServiceImpl service;

    private Reserva buildReserva(Integer id, Reserva.EstadoReserva estado) {
        Reserva r = new Reserva();
        r.setIdReserva(id);
        r.setFechaReserva(LocalDate.now());
        r.setEstado(estado);
        return r;
    }

    @Test
    void findAll_retornaTodasLasReservas() {
        when(repo.findAll()).thenReturn(List.of(
                buildReserva(1, Reserva.EstadoReserva.Pendiente),
                buildReserva(2, Reserva.EstadoReserva.Confirmado)
        ));

        assertEquals(2, service.findAll().size());
    }

    @Test
    void findByCliente_retornaReservasDelCliente() {
        when(repo.findByClienteIdCliente(5)).thenReturn(
                List.of(buildReserva(1, Reserva.EstadoReserva.Pendiente))
        );

        List<Reserva> result = service.findByCliente(5);

        assertEquals(1, result.size());
        assertEquals(Reserva.EstadoReserva.Pendiente, result.get(0).getEstado());
    }

    @Test
    void findByRango_retornaReservasEnRango() {
        LocalDate hoy = LocalDate.now();
        LocalDate fin = hoy.plusDays(7);
        when(repo.findByFechaReservaBetween(hoy, fin)).thenReturn(
                List.of(buildReserva(1, Reserva.EstadoReserva.Pendiente))
        );

        List<Reserva> result = service.findByRango(hoy, fin);

        assertEquals(1, result.size());
    }

    @Test
    void findById_reservaExiste_retornaReserva() {
        Reserva r = buildReserva(1, Reserva.EstadoReserva.Pendiente);
        when(repo.findById(1)).thenReturn(Optional.of(r));

        Reserva result = service.findById(1);

        assertEquals(1, result.getIdReserva());
    }

    @Test
    void findById_reservaNoExiste_lanzaExcepcion() {
        when(repo.findById(99)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> service.findById(99));
    }

    @Test
    void updateEstado_actualizaEstadoYGuarda() {
        Reserva r = buildReserva(1, Reserva.EstadoReserva.Pendiente);
        when(repo.findById(1)).thenReturn(Optional.of(r));
        when(repo.save(any(Reserva.class))).thenReturn(r);

        Reserva result = service.updateEstado(1, Reserva.EstadoReserva.Confirmado);

        assertEquals(Reserva.EstadoReserva.Confirmado, result.getEstado());
        verify(repo).save(r);
    }

    @Test
    void updateEstado_reservaNoExiste_lanzaExcepcion() {
        when(repo.findById(99)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> service.updateEstado(99, Reserva.EstadoReserva.Cancelado));
    }

    @Test
    void delete_invocaDeleteById() {
        service.delete(1);
        verify(repo).deleteById(1);
    }

    @Test
    void countPendientes_retornaCantidadCorrecta() {
        when(repo.countPendientes()).thenReturn(3L);
        assertEquals(3L, service.countPendientes());
    }
}

package com.safarikids.service;

import com.safarikids.model.Reserva;
import com.safarikids.model.Usuario;
import com.safarikids.repository.ReservaRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Envía el correo de recordatorio ~1 hora antes de cada cita.
 * Corre cada 5 minutos y busca reservas cuyo horario cae en la ventana [ahora+55min, ahora+65min).
 * El flag {@code recordatorioEnviado} evita duplicados aunque una reserva caiga en dos corridas.
 */
@Component
@RequiredArgsConstructor
public class RecordatorioScheduler {

    private static final Logger log = LoggerFactory.getLogger(RecordatorioScheduler.class);

    private final ReservaRepository reservaRepo;
    private final EmailService emailService;

    @Scheduled(fixedRate = 300_000) // cada 5 minutos
    @Transactional
    public void enviarRecordatorios() {
        LocalDateTime desde = LocalDateTime.now().plusMinutes(55);
        LocalDateTime hasta = LocalDateTime.now().plusMinutes(65);

        // Borde de medianoche: si la ventana cruza a otro día la omitimos (caso muy poco frecuente).
        if (!desde.toLocalDate().equals(hasta.toLocalDate())) return;

        List<Reserva> proximas = reservaRepo.findParaRecordatorio(
            desde.toLocalDate(), desde.toLocalTime(), hasta.toLocalTime());
        if (proximas.isEmpty()) return;

        for (Reserva r : proximas) {
            Usuario u = (r.getCliente() != null) ? r.getCliente().getUsuario() : null;
            if (u != null) {
                emailService.enviarRecordatorio(
                    u.getCorreo(), u.getNombres(),
                    r.getCodigoReserva(),
                    r.getFechaReserva() != null ? r.getFechaReserva().toString() : null,
                    r.getHorario() != null ? r.getHorario().getHoraInicio().toString() : null,
                    r.getLocal());
            }
            r.setRecordatorioEnviado(true);
            reservaRepo.save(r);
        }
        log.info("[Recordatorio] Procesadas {} reservas próximas", proximas.size());
    }
}

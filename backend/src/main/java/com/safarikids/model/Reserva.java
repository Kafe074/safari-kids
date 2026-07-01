package com.safarikids.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import java.time.LocalDate;

@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
@Entity @Table(name = "Reserva")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Reserva {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idReserva;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cliente", nullable = false)
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_empleado", nullable = false)
    private Empleado empleado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_horario", nullable = false)
    private Horario horario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_asiento", nullable = false)
    private Asiento asiento;

    @Column(nullable = false)
    private LocalDate fechaReserva;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private EstadoReserva estado = EstadoReserva.Pendiente;

    @Column(length = 100)
    private String local;

    @Column(length = 200)
    private String observaciones;

    @Column(length = 20, unique = true)
    private String codigoReserva;

    /** Evita reenviar el recordatorio "1 hora antes". Las filas antiguas quedan en NULL (tratado como false). */
    @Column
    @Builder.Default
    private Boolean recordatorioEnviado = false;

    public enum EstadoReserva { Pendiente, Confirmado, Cancelado }
}

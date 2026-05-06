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
    @Column(columnDefinition = "ENUM('Pendiente','Confirmado','Cancelado') DEFAULT 'Pendiente'")
    private EstadoReserva estado;

    @Column(length = 200)
    private String observaciones;

    public enum EstadoReserva { Pendiente, Confirmado, Cancelado }
}

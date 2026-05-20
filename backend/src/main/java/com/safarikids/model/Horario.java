package com.safarikids.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import java.time.LocalTime;

@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
@Entity @Table(name = "Horario")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Horario {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idHorario;

    @Column(nullable = false)
    private LocalTime horaInicio;

    @Column(nullable = false)
    private LocalTime horaFin;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private EstadoHorario estado = EstadoHorario.Disponible;

    public enum EstadoHorario { Disponible, No_disponible }
}

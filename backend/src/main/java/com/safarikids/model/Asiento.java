package com.safarikids.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
@Entity @Table(name = "Asiento")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Asiento {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idAsiento;

    @Column(length = 50)
    private String nombre;

    @Column(length = 50)
    private String tipo;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('Disponible','Ocupado') DEFAULT 'Disponible'")
    private EstadoAsiento estado;

    @Column(length = 150)
    private String descripcion;

    private Integer capacidad;

    public enum EstadoAsiento { Disponible, Ocupado }
}

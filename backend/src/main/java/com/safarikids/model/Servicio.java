package com.safarikids.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import java.math.BigDecimal;

@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
@Entity @Table(name = "Servicio")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Servicio {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idServicio;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(length = 150)
    private String descripcion;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precio;

    @Column(nullable = false)
    private Integer duracion;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private EstadoServicio estado = EstadoServicio.Disponible;

    public enum EstadoServicio { Disponible, No_disponible }
}

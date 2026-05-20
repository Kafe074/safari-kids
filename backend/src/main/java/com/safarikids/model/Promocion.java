package com.safarikids.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;

@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
@Entity @Table(name = "Promocion")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Promocion {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idPromocion;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(length = 150)
    private String descripcion;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal descuento;

    private LocalDate fechaInicio;
    private LocalDate fechaFin;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private EstadoPromocion estado = EstadoPromocion.Activa;

    @ManyToMany
    @JoinTable(name = "Promocion_Servicio",
        joinColumns = @JoinColumn(name = "id_promocion"),
        inverseJoinColumns = @JoinColumn(name = "id_servicio"))
    private Set<Servicio> servicios;

    public enum EstadoPromocion { Activa, Inactiva }
}

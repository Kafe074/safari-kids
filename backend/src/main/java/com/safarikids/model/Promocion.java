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

    @Column(unique = true, length = 50)
    private String codigo;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private TipoPromocion tipo = TipoPromocion.Global;

    @Column(nullable = false)
    private Boolean primerServicio = false;

    @Column(nullable = false)
    private Boolean primerProducto = false;

    private LocalDate fechaInicio;
    private LocalDate fechaFin;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private EstadoPromocion estado = EstadoPromocion.Activa;

    @ManyToMany
    @JoinTable(name = "Promocion_Servicio",
        joinColumns = @JoinColumn(name = "id_promocion"),
        inverseJoinColumns = @JoinColumn(name = "id_servicio"))
    @JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
    private Set<Servicio> servicios;

    public enum TipoPromocion { Global, Codigo, PrimerServicio }
    public enum EstadoPromocion { Activa, Inactiva }
}

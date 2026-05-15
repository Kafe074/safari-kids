package com.safarikids.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import java.math.BigDecimal;

@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
@Entity @Table(name = "Servicio_Insumo",
    uniqueConstraints = @UniqueConstraint(columnNames = {"id_servicio", "id_insumo"}))
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ServicioInsumo {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idServicioInsumo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_servicio", nullable = false)
    @JsonIgnoreProperties("insumos")
    private Servicio servicio;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_insumo", nullable = false)
    private Insumo insumo;

    @Column(nullable = false, precision = 10, scale = 3)
    private BigDecimal cantidad;
}

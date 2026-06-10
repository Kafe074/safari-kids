package com.safarikids.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
@Entity @Table(name = "Detalle_Solicitud_Insumo")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class DetalleSolicitudInsumo {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idDetalle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_solicitud", nullable = false)
    @JsonIgnore @ToString.Exclude @EqualsAndHashCode.Exclude
    private SolicitudInsumo solicitud;

    /** Instrumento del salón (tijeras, máquina, peine...). Nullable si el ítem es un producto. */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_insumo")
    private Insumo insumo;

    /** Producto del catálogo (shampoo, gel...). Nullable si el ítem es un insumo. */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_producto")
    private Producto producto;

    private Integer cantidad;
}

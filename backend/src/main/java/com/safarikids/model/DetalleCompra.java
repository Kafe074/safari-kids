package com.safarikids.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import java.math.BigDecimal;

@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
@Entity @Table(name = "Detalle_Compra")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class DetalleCompra {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idDetalleCompra;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_compra", nullable = false)
    private Compra compra;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto producto;

    @Column(nullable = false)
    private Integer cantidad;

    @Column(precision = 10, scale = 2)
    private BigDecimal costoUnitario;

    @Column(precision = 10, scale = 2)
    private BigDecimal subtotal;
}

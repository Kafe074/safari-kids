package com.safarikids.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
@Entity @Table(name = "Movimiento_Inventario")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class MovimientoInventario {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idMovimiento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto producto;

    @Enumerated(EnumType.STRING)
    private TipoMovimiento tipo;

    @Column(nullable = false)
    private Integer cantidad;

    @CreationTimestamp
    private LocalDateTime fechaMovimiento;

    @Column(length = 150)
    private String motivo;

    public enum TipoMovimiento { Entrada, Salida, Ajuste }
}

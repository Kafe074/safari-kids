package com.safarikids.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
@Entity @Table(name = "Venta")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Venta {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idVenta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cliente")
    private Cliente cliente;

    @Column(columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime fechaVenta;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('Completado','Anulado') DEFAULT 'Completado'")
    private EstadoVenta estado;

    public enum EstadoVenta { Completado, Anulado }
}

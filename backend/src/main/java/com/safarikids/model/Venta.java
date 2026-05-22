package com.safarikids.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
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

    @CreationTimestamp
    private LocalDateTime fechaVenta;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private EstadoVenta estado = EstadoVenta.Completado;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private MetodoEntrega metodoEntrega = MetodoEntrega.RecojoEnLocal;

    @Column(length = 200)
    private String direccionEntrega;

    @Column(length = 100)
    private String sucursalEntrega;

    @Column(precision = 6, scale = 2)
    private BigDecimal costoDelivery = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(length = 25)
    private EstadoEntrega estadoEntrega = EstadoEntrega.Pendiente;

    public enum EstadoVenta  { Completado, Anulado }
    public enum MetodoEntrega { Delivery, RecojoEnLocal }
    public enum EstadoEntrega { Pendiente, EntregadoDelivery, EntregadaCliente }
}

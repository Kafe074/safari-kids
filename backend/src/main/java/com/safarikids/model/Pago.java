package com.safarikids.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
@Entity @Table(name = "Pago")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Pago {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idPago;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_reserva", nullable = false, unique = true)
    private Reserva reserva;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal montoTotal;

    @Enumerated(EnumType.STRING)
    private MetodoPago metodoPago;

    private LocalDate fechaPago;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('Pendiente','Pagado') DEFAULT 'Pendiente'")
    private EstadoPago estado;

    @Column(length = 100)
    private String referencia;

    public enum MetodoPago { Efectivo, Tarjeta, Simulado }
    public enum EstadoPago { Pendiente, Pagado }
}

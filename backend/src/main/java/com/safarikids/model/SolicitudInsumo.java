package com.safarikids.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
@Entity @Table(name = "Solicitud_Insumo")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class SolicitudInsumo {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idSolicitud;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_empleado", nullable = false)
    private Empleado empleado;

    private LocalDateTime fechaSolicitud;

    @Enumerated(EnumType.STRING)
    private EstadoSolicitud estado;

    @Column(length = 255)
    private String observaciones;

    @OneToMany(mappedBy = "solicitud", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<DetalleSolicitudInsumo> detalles = new ArrayList<>();

    @PrePersist
    void prePersist() {
        if (fechaSolicitud == null) fechaSolicitud = LocalDateTime.now();
        if (estado == null) estado = EstadoSolicitud.Pendiente;
    }

    public enum EstadoSolicitud { Pendiente, Aprobada, Entregada, Rechazada }
}

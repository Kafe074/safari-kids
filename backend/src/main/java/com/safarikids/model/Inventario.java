package com.safarikids.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
@Entity @Table(name = "Inventario")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Inventario {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idInventario;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto producto;

    @Column(nullable = false)
    private Integer stockActual;

    private Integer stockMinimo;

    @Column(length = 100)
    private String ubicacion;

    @Column(length = 100)
    private String sucursal;
}

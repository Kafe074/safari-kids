package com.safarikids.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import java.math.BigDecimal;

@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
@Entity @Table(name = "Producto")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Producto {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idProducto;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(length = 150)
    private String descripcion;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precioVenta;

    @Column(precision = 10, scale = 2)
    private BigDecimal costo;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('Activo','Inactivo') DEFAULT 'Activo'")
    private EstadoProducto estado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_categoria")
    private CategoriaProducto categoria;

    public enum EstadoProducto { Activo, Inactivo }
}

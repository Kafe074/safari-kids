package com.safarikids.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
@Entity @Table(name = "Categoria_Producto")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CategoriaProducto {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idCategoria;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(length = 150)
    private String descripcion;
}

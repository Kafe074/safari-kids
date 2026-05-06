package com.safarikids.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
@Entity @Table(name = "Proveedor")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Proveedor {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idProveedor;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(length = 20)
    private String telefono;

    @Column(length = 150)
    private String direccion;

    @Column(length = 100)
    private String correo;
}

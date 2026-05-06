package com.safarikids.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
@Entity @Table(name = "Rol")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Rol {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idRol;

    @Column(nullable = false, length = 50)
    private String nombre;

    @Column(length = 100)
    private String descripcion;
}

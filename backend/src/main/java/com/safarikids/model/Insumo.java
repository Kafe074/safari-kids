package com.safarikids.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
@Entity @Table(name = "Insumo")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Insumo {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idInsumo;

    @Column(length = 100)
    private String nombre;

    @Column(length = 20)
    private String unidadMedida;

    private Integer stock;
}

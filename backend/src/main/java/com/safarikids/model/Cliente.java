package com.safarikids.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import java.time.LocalDate;

@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
@Entity @Table(name = "Cliente")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Cliente {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idCliente;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false, unique = true)
    private Usuario usuario;

    @Column(length = 8, unique = true)
    private String dni;

    /** false = cuenta provisional creada en tienda (walk-in), aún no reclamada por el cliente.
     *  null/true = cuenta normal o ya reclamada desde la web. */
    private Boolean reclamada;

    @Column(length = 20)
    private String telefono;

    @Column(length = 150)
    private String direccion;

    private LocalDate fechaNacimiento;
}

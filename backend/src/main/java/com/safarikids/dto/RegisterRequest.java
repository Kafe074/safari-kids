package com.safarikids.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class RegisterRequest {
    private String nombres;
    private String apellidos;
    private String correo;
    private String contrasena;
    private String telefono;
    private String direccion;
    private LocalDate fechaNacimiento;
}

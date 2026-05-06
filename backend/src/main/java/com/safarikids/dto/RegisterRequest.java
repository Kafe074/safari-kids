package com.safarikids.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String nombres;
    private String apellidos;
    private String correo;
    private String contrasena;
    private String telefono;
}

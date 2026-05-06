package com.safarikids.dto;
import lombok.*;
@Data @AllArgsConstructor
public class LoginResponse {
    private String token;
    private String correo;
    private String nombreCompleto;
    private String rol;
}

package com.safarikids.dto;

import com.safarikids.model.Empleado;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/** Alta de empleado: crea el Usuario (login, rol "Empleado") junto con el registro Empleado. */
@Data
public class EmpleadoRequest {
    // Datos de acceso / persona
    @NotBlank(message = "Los nombres son obligatorios")
    private String nombres;
    @NotBlank(message = "Los apellidos son obligatorios")
    private String apellidos;
    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "Correo no válido")
    private String correo;
    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
    private String contrasena;
    // Datos del puesto
    private String especialidad;
    private String sucursal;
    private Empleado.Turno turno;
    private Empleado.EstadoEmpleado estado;
}

package com.safarikids.dto;

import com.safarikids.model.Empleado;
import lombok.Data;

/** Alta de empleado: crea el Usuario (login, rol "Empleado") junto con el registro Empleado. */
@Data
public class EmpleadoRequest {
    // Datos de acceso / persona
    private String nombres;
    private String apellidos;
    private String correo;
    private String contrasena;
    // Datos del puesto
    private String especialidad;
    private String sucursal;
    private Empleado.Turno turno;
    private Empleado.EstadoEmpleado estado;
}

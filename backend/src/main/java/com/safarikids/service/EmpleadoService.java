package com.safarikids.service;
import com.safarikids.model.Empleado;
import java.util.List;
public interface EmpleadoService {
    List<Empleado> findAll();
    List<Empleado> findActivos();
    Empleado findById(Integer id);
    Empleado save(Empleado e);
    void delete(Integer id);
}
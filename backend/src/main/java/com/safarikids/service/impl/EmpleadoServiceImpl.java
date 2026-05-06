package com.safarikids.service.impl;
import com.safarikids.model.Empleado;
import com.safarikids.repository.EmpleadoRepository;
import com.safarikids.service.EmpleadoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
@Service @RequiredArgsConstructor
public class EmpleadoServiceImpl implements EmpleadoService {
    private final EmpleadoRepository repo;
    public List<Empleado> findAll() { return repo.findAll(); }
    public List<Empleado> findActivos() { return repo.findByEstado(Empleado.EstadoEmpleado.Activo); }
    public Empleado findById(Integer id) { return repo.findById(id).orElseThrow(() -> new RuntimeException("Empleado no encontrado: " + id)); }
    public Empleado save(Empleado e) { return repo.save(e); }
    public void delete(Integer id) { repo.deleteById(id); }
}
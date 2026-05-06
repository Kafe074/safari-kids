package com.safarikids.service.impl;
import com.safarikids.model.Servicio;
import com.safarikids.repository.ServicioRepository;
import com.safarikids.service.ServicioService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
@Service @RequiredArgsConstructor
public class ServicioServiceImpl implements ServicioService {
    private final ServicioRepository repo;
    public List<Servicio> findAll() { return repo.findAll(); }
    public List<Servicio> findDisponibles() { return repo.findByEstado(Servicio.EstadoServicio.Disponible); }
    public Servicio findById(Integer id) { return repo.findById(id).orElseThrow(() -> new RuntimeException("Servicio no encontrado: " + id)); }
    public Servicio save(Servicio s) { return repo.save(s); }
    public void delete(Integer id) { repo.deleteById(id); }
}
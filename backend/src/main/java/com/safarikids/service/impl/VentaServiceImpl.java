package com.safarikids.service.impl;
import com.safarikids.model.Venta;
import com.safarikids.repository.VentaRepository;
import com.safarikids.service.VentaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
@Service @RequiredArgsConstructor
public class VentaServiceImpl implements VentaService {
    private final VentaRepository repo;
    public List<Venta> findAll() { return repo.findAll(); }
    public Venta findById(Integer id) { return repo.findById(id).orElseThrow(() -> new RuntimeException("Venta no encontrada: " + id)); }
    public Venta save(Venta v) { return repo.save(v); }
    public void delete(Integer id) { repo.deleteById(id); }
    public long count() { return repo.count(); }
}
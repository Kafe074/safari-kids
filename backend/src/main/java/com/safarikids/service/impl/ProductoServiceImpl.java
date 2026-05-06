package com.safarikids.service.impl;
import com.safarikids.model.Producto;
import com.safarikids.repository.ProductoRepository;
import com.safarikids.service.ProductoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
@Service @RequiredArgsConstructor
public class ProductoServiceImpl implements ProductoService {
    private final ProductoRepository repo;
    public List<Producto> findAll() { return repo.findAll(); }
    public List<Producto> findActivos() { return repo.findByEstado(Producto.EstadoProducto.Activo); }
    public Producto findById(Integer id) { return repo.findById(id).orElseThrow(() -> new RuntimeException("Producto no encontrado: " + id)); }
    public Producto save(Producto p) { return repo.save(p); }
    public void delete(Integer id) { repo.deleteById(id); }
    public long count() { return repo.count(); }
}
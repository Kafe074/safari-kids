package com.safarikids.service.impl;
import com.safarikids.model.Proveedor;
import com.safarikids.repository.ProveedorRepository;
import com.safarikids.service.ProveedorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
@Service @RequiredArgsConstructor
public class ProveedorServiceImpl implements ProveedorService {
    private final ProveedorRepository repo;
    public List<Proveedor> findAll() { return repo.findAll(); }
    public Proveedor findById(Integer id) { return repo.findById(id).orElseThrow(() -> new RuntimeException("Proveedor no encontrado")); }
    public Proveedor save(Proveedor p) { return repo.save(p); }
    public void delete(Integer id) { repo.deleteById(id); }
}
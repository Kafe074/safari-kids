package com.safarikids.service.impl;
import com.safarikids.model.Compra;
import com.safarikids.repository.CompraRepository;
import com.safarikids.service.CompraService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
@Service @RequiredArgsConstructor
public class CompraServiceImpl implements CompraService {
    private final CompraRepository repo;
    public List<Compra> findAll() { return repo.findAll(); }
    public Compra findById(Integer id) { return repo.findById(id).orElseThrow(() -> new RuntimeException("Compra no encontrada")); }
    public Compra save(Compra c) { return repo.save(c); }
    public void delete(Integer id) { repo.deleteById(id); }
}
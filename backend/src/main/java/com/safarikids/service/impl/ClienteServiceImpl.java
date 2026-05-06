package com.safarikids.service.impl;
import com.safarikids.model.Cliente;
import com.safarikids.repository.ClienteRepository;
import com.safarikids.service.ClienteService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
@Service @RequiredArgsConstructor
public class ClienteServiceImpl implements ClienteService {
    private final ClienteRepository repo;
    public List<Cliente> findAll() { return repo.findAll(); }
    public Cliente findById(Integer id) { return repo.findById(id).orElseThrow(() -> new RuntimeException("Cliente no encontrado: " + id)); }
    public Cliente save(Cliente c) { return repo.save(c); }
    public void delete(Integer id) { repo.deleteById(id); }
    public long count() { return repo.count(); }
}
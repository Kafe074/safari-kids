package com.safarikids.service;
import com.safarikids.model.Cliente;
import java.util.List;
public interface ClienteService {
    List<Cliente> findAll();
    Cliente findById(Integer id);
    Cliente save(Cliente c);
    void delete(Integer id);
    long count();
}
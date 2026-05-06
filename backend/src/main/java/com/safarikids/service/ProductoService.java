package com.safarikids.service;
import com.safarikids.model.Producto;
import java.util.List;
public interface ProductoService {
    List<Producto> findAll();
    List<Producto> findActivos();
    Producto findById(Integer id);
    Producto save(Producto p);
    void delete(Integer id);
    long count();
}
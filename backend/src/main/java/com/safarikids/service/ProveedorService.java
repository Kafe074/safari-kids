package com.safarikids.service;
import com.safarikids.model.Proveedor;
import java.util.List;
public interface ProveedorService {
    List<Proveedor> findAll();
    Proveedor findById(Integer id);
    Proveedor save(Proveedor p);
    void delete(Integer id);
}
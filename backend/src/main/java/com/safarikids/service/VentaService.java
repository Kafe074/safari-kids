package com.safarikids.service;
import com.safarikids.model.Venta;
import java.util.List;
public interface VentaService {
    List<Venta> findAll();
    Venta findById(Integer id);
    Venta save(Venta v);
    void delete(Integer id);
    long count();
}
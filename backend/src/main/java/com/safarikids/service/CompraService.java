package com.safarikids.service;
import com.safarikids.model.Compra;
import java.util.List;
public interface CompraService {
    List<Compra> findAll();
    Compra findById(Integer id);
    Compra save(Compra c);
    void delete(Integer id);
}
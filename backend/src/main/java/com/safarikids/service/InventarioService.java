package com.safarikids.service;
import com.safarikids.model.Inventario;
import java.util.List;
public interface InventarioService {
    List<Inventario> findAll();
    List<Inventario> findStockBajo();
    Inventario findById(Integer id);
    Inventario findByProducto(Integer idProducto);
    Inventario save(Inventario i);
    Inventario ajustarStock(Integer idProducto, int cantidad, String motivo);
}
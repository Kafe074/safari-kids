package com.safarikids.repository;

import com.safarikids.model.Inventario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface InventarioRepository extends JpaRepository<Inventario, Integer> {
    Optional<Inventario>  findByProductoIdProducto(Integer idProducto);
    List<Inventario>      findBySucursal(String sucursal);
    List<Inventario>      findBySucursalIsNull();
    Optional<Inventario>  findByProductoIdProductoAndSucursal(Integer idProducto, String sucursal);
}

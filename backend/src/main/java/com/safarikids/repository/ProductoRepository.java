package com.safarikids.repository;
import com.safarikids.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface ProductoRepository extends JpaRepository<Producto, Integer> {
    List<Producto> findByEstado(Producto.EstadoProducto estado);
}
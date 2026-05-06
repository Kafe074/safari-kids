package com.safarikids.repository;
import com.safarikids.model.DetalleCompra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface DetalleCompraRepository extends JpaRepository<DetalleCompra, Integer> {
    void deleteByCompraIdCompra(Integer idCompra);
}

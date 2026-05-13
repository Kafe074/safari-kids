package com.safarikids.repository;
import com.safarikids.model.Venta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;
@Repository
public interface VentaRepository extends JpaRepository<Venta, Integer> {
    @Query("SELECT COALESCE(SUM(v.total),0) FROM Venta v WHERE v.estado = 'Completado'")
    BigDecimal sumTotalCompletadas();
    List<Venta> findByClienteIdClienteOrderByFechaVentaDesc(Integer idCliente);
}
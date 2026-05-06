package com.safarikids.service.impl;
import com.safarikids.model.*;
import com.safarikids.repository.*;
import com.safarikids.service.InventarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
@Service @RequiredArgsConstructor
public class InventarioServiceImpl implements InventarioService {
    private final InventarioRepository repo;
    private final MovimientoInventarioRepository movRepo;
    public List<Inventario> findAll() { return repo.findAll(); }
    public List<Inventario> findStockBajo() {
        return repo.findAll().stream()
            .filter(i -> i.getStockActual() != null && i.getStockMinimo() != null && i.getStockActual() <= i.getStockMinimo())
            .collect(Collectors.toList());
    }
    public Inventario findById(Integer id) { return repo.findById(id).orElseThrow(() -> new RuntimeException("Inventario no encontrado")); }
    public Inventario findByProducto(Integer id) { return repo.findByProductoIdProducto(id).orElseThrow(() -> new RuntimeException("Sin inventario para producto " + id)); }
    public Inventario save(Inventario i) { return repo.save(i); }
    public Inventario ajustarStock(Integer idProducto, int cantidad, String motivo) {
        Inventario inv = findByProducto(idProducto);
        inv.setStockActual(inv.getStockActual() + cantidad);
        MovimientoInventario mov = MovimientoInventario.builder()
            .producto(inv.getProducto())
            .tipo(cantidad >= 0 ? MovimientoInventario.TipoMovimiento.Entrada : MovimientoInventario.TipoMovimiento.Salida)
            .cantidad(Math.abs(cantidad))
            .fechaMovimiento(LocalDateTime.now())
            .motivo(motivo)
            .build();
        movRepo.save(mov);
        return repo.save(inv);
    }
}
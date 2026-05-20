package com.safarikids.service;

import com.safarikids.model.Producto;
import com.safarikids.repository.ProductoRepository;
import com.safarikids.service.impl.ProductoServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductoServiceImplTest {

    @Mock
    private ProductoRepository repo;

    @InjectMocks
    private ProductoServiceImpl service;

    private Producto buildProducto(Integer id, String nombre, Producto.EstadoProducto estado) {
        return Producto.builder()
                .idProducto(id)
                .nombre(nombre)
                .precioVenta(BigDecimal.valueOf(25.00))
                .estado(estado)
                .build();
    }

    @Test
    void findAll_retornaListaCompleta() {
        when(repo.findAll()).thenReturn(List.of(
                buildProducto(1, "Shampoo Kids", Producto.EstadoProducto.Activo),
                buildProducto(2, "Gel Suave", Producto.EstadoProducto.Inactivo)
        ));

        assertEquals(2, service.findAll().size());
        verify(repo).findAll();
    }

    @Test
    void findActivos_retornaSoloProductosActivos() {
        when(repo.findByEstado(Producto.EstadoProducto.Activo)).thenReturn(
                List.of(buildProducto(1, "Shampoo Kids", Producto.EstadoProducto.Activo))
        );

        List<Producto> result = service.findActivos();

        assertEquals(1, result.size());
        assertEquals(Producto.EstadoProducto.Activo, result.get(0).getEstado());
    }

    @Test
    void findById_productoExiste_retornaProducto() {
        Producto p = buildProducto(1, "Shampoo Kids", Producto.EstadoProducto.Activo);
        when(repo.findById(1)).thenReturn(Optional.of(p));

        Producto result = service.findById(1);

        assertEquals("Shampoo Kids", result.getNombre());
        assertEquals(BigDecimal.valueOf(25.00), result.getPrecioVenta());
    }

    @Test
    void findById_productoNoExiste_lanzaExcepcion() {
        when(repo.findById(99)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> service.findById(99));
        assertTrue(ex.getMessage().contains("99"));
    }

    @Test
    void save_guardaYRetornaProducto() {
        Producto p = buildProducto(null, "Nuevo Producto", Producto.EstadoProducto.Activo);
        when(repo.save(p)).thenReturn(p);

        Producto result = service.save(p);

        assertNotNull(result);
        verify(repo).save(p);
    }

    @Test
    void delete_invocaDeleteById() {
        service.delete(1);
        verify(repo).deleteById(1);
    }

    @Test
    void count_retornaTotalProductos() {
        when(repo.count()).thenReturn(10L);
        assertEquals(10L, service.count());
    }
}

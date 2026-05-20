package com.safarikids.service;

import com.safarikids.model.Cliente;
import com.safarikids.repository.ClienteRepository;
import com.safarikids.service.impl.ClienteServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClienteServiceImplTest {

    @Mock
    private ClienteRepository repo;

    @InjectMocks
    private ClienteServiceImpl service;

    @Test
    void findAll_retornaListaDeClientes() {
        Cliente c1 = new Cliente(); c1.setIdCliente(1);
        Cliente c2 = new Cliente(); c2.setIdCliente(2);
        when(repo.findAll()).thenReturn(List.of(c1, c2));

        List<Cliente> result = service.findAll();

        assertEquals(2, result.size());
        verify(repo).findAll();
    }

    @Test
    void findById_clienteExiste_retornaCliente() {
        Cliente cliente = new Cliente();
        cliente.setIdCliente(1);
        when(repo.findById(1)).thenReturn(Optional.of(cliente));

        Cliente result = service.findById(1);

        assertNotNull(result);
        assertEquals(1, result.getIdCliente());
    }

    @Test
    void findById_clienteNoExiste_lanzaExcepcion() {
        when(repo.findById(99)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> service.findById(99));
        assertTrue(ex.getMessage().contains("99"));
    }

    @Test
    void save_guardaYRetornaCliente() {
        Cliente cliente = new Cliente();
        cliente.setIdCliente(1);
        when(repo.save(cliente)).thenReturn(cliente);

        Cliente result = service.save(cliente);

        assertNotNull(result);
        verify(repo).save(cliente);
    }

    @Test
    void delete_llamaDeleteById() {
        service.delete(1);
        verify(repo).deleteById(1);
    }

    @Test
    void count_retornaCantidadDeClientes() {
        when(repo.count()).thenReturn(5L);
        assertEquals(5L, service.count());
    }
}

package com.safarikids.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.safarikids.dto.LoginRequest;
import com.safarikids.model.Producto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProductoControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String adminToken;

    @BeforeEach
    void obtenerTokenAdmin() throws Exception {
        LoginRequest login = new LoginRequest();
        login.setCorreo("admin@safarikids.com");
        login.setContrasena("admin123");

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(login)))
                .andReturn();

        adminToken = objectMapper.readTree(result.getResponse().getContentAsString())
                .path("data").path("token").asText();
    }

    @Test
    void getAll_sinAutenticacion_retornaListaPublica() throws Exception {
        mockMvc.perform(get("/api/productos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").isNumber());
    }

    @Test
    void getById_productoExistente_retornaProducto() throws Exception {
        mockMvc.perform(get("/api/productos/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.idProducto").value(1));
    }

    @Test
    void getById_productoNoExistente_retorna404() throws Exception {
        mockMvc.perform(get("/api/productos/9999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void create_conTokenAdmin_creaProductoCorrectamente() throws Exception {
        Producto nuevo = Producto.builder()
                .nombre("Producto Test Integ")
                .precioVenta(BigDecimal.valueOf(19.90))
                .estado(Producto.EstadoProducto.Activo)
                .build();

        mockMvc.perform(post("/api/productos")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevo)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.nombre").value("Producto Test Integ"))
                .andExpect(jsonPath("$.data.idProducto").isNumber());
    }

    @Test
    void create_sinAutenticacion_retorna401() throws Exception {
        Producto nuevo = Producto.builder()
                .nombre("Sin Auth")
                .precioVenta(BigDecimal.valueOf(10.00))
                .build();

        mockMvc.perform(post("/api/productos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevo)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void update_conToken_actualizaProducto() throws Exception {
        Producto actualizado = Producto.builder()
                .idProducto(1)
                .nombre("Shampoo Kids Actualizado")
                .precioVenta(BigDecimal.valueOf(27.00))
                .estado(Producto.EstadoProducto.Activo)
                .build();

        mockMvc.perform(put("/api/productos/1")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(actualizado)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.nombre").value("Shampoo Kids Actualizado"));
    }

    @Test
    void delete_conToken_eliminaProducto() throws Exception {
        // Primero creamos un producto para luego eliminarlo
        Producto nuevo = Producto.builder()
                .nombre("Para Eliminar")
                .precioVenta(BigDecimal.valueOf(5.00))
                .estado(Producto.EstadoProducto.Activo)
                .build();

        MvcResult crear = mockMvc.perform(post("/api/productos")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevo)))
                .andReturn();

        int id = objectMapper.readTree(crear.getResponse().getContentAsString())
                .path("data").path("idProducto").asInt();

        mockMvc.perform(delete("/api/productos/" + id)
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}

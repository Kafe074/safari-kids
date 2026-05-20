package com.safarikids.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.safarikids.dto.LoginRequest;
import com.safarikids.dto.RegisterRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void login_credencialesCorrectas_retornaTokenYRol() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setCorreo("admin@safarikids.com");
        req.setContrasena("admin123");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").isNotEmpty())
                .andExpect(jsonPath("$.data.correo").value("admin@safarikids.com"))
                .andExpect(jsonPath("$.data.rol").value("Administrador"));
    }

    @Test
    void login_contrasenaIncorrecta_retorna401() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setCorreo("admin@safarikids.com");
        req.setContrasena("contrasena_erronea");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void login_correoNoRegistrado_retorna401() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setCorreo("noexiste@test.com");
        req.setContrasena("cualquiera");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void register_correoNuevo_creaClienteYRetornaToken() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setNombres("Juan");
        req.setApellidos("Pérez");
        req.setCorreo("juantest_integ@gmail.com");
        req.setContrasena("pass1234");
        req.setTelefono("987654321");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").isNotEmpty())
                .andExpect(jsonPath("$.data.correo").value("juantest_integ@gmail.com"))
                .andExpect(jsonPath("$.data.rol").value("Cliente"));
    }

    @Test
    void register_correoYaRegistrado_retornaBadRequest() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setNombres("Duplicado");
        req.setApellidos("Test");
        req.setCorreo("admin@safarikids.com");
        req.setContrasena("cualquier123");
        req.setTelefono("000000000");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }
}

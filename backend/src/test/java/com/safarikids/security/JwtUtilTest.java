package com.safarikids.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", "SafariKidsTestSecret1234567890!XyZ987654321AbCd");
        ReflectionTestUtils.setField(jwtUtil, "expiration", 3600000L);
    }

    private UserDetails userOf(String username) {
        return new User(username, "password", Collections.emptyList());
    }

    @Test
    void generateToken_retornaTokenNoVacio() {
        String token = jwtUtil.generateToken(userOf("test@safarikids.com"));
        assertNotNull(token);
        assertFalse(token.isBlank());
    }

    @Test
    void extractUsername_retornaCorreoIncrustadoEnToken() {
        String email = "admin@safarikids.com";
        String token = jwtUtil.generateToken(userOf(email));

        assertEquals(email, jwtUtil.extractUsername(token));
    }

    @Test
    void validateToken_tokenValido_retornaTrue() {
        UserDetails ud = userOf("sofia@gmail.com");
        String token = jwtUtil.generateToken(ud);

        assertTrue(jwtUtil.validateToken(token, ud));
    }

    @Test
    void validateToken_usuarioDiferente_retornaFalse() {
        String token = jwtUtil.generateToken(userOf("a@test.com"));
        UserDetails otro = userOf("b@test.com");

        assertFalse(jwtUtil.validateToken(token, otro));
    }

    @Test
    void validateToken_tokenMalformado_retornaFalse() {
        UserDetails ud = userOf("test@test.com");
        assertFalse(jwtUtil.validateToken("token.invalido.xyz", ud));
    }

    @Test
    void generateToken_tokenTieneFormato_tresParts() {
        String token = jwtUtil.generateToken(userOf("test@test.com"));
        // JWT: header.payload.signature
        assertEquals(3, token.split("\\.").length);
    }
}

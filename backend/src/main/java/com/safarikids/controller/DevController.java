package com.safarikids.controller;

import com.safarikids.dto.ApiResponse;
import com.safarikids.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Endpoints temporales de diagnóstico. Requieren autenticación.
 * Útil para ver por qué el correo no llega sin tener que leer los logs del hosting.
 * ELIMINAR una vez resuelto el problema de correo.
 */
@RestController
@RequestMapping("/api/dev")
@RequiredArgsConstructor
public class DevController {

    private final EmailService emailService;

    @Value("${spring.mail.host:}")  private String host;
    @Value("${spring.mail.port:}")  private String port;

    /** Intenta un envío SÍNCRONO y devuelve el resultado/error real + la config efectiva. */
    @PostMapping("/mail-test")
    public ResponseEntity<ApiResponse<Map<String, Object>>> mailTest(@RequestParam String to) {
        Map<String, Object> info = new LinkedHashMap<>();
        info.put("configurado", emailService.estaConfigurado());
        info.put("username", emailService.usernameConfigurado());
        info.put("host", host);
        info.put("port", port);

        String error = emailService.enviarDiagnostico(
            to, "Prueba de correo — Safari Kids",
            "<p>Si ves esto, el envío de correos <b>funciona</b>. ✅</p>");

        info.put("resultado", error == null ? "ENVIADO_OK" : "ERROR");
        info.put("error", error);
        return ResponseEntity.ok(ApiResponse.ok(info));
    }
}

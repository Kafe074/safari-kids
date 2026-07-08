package com.safarikids.exception;

import com.safarikids.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

/** Convierte errores de validación (@Valid) y errores de negocio (RuntimeException con mensaje)
 *  a la forma ApiResponse que ya espera el frontend, en vez del cuerpo genérico de Spring. */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException ex) {
        String mensaje = ex.getBindingResult().getFieldErrors().stream()
            .map(fe -> fe.getDefaultMessage())
            .distinct()
            .collect(Collectors.joining(". "));
        return ResponseEntity.badRequest().body(ApiResponse.error(mensaje.isBlank() ? "Datos inválidos" : mensaje));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<Void>> handleRuntime(RuntimeException ex) {
        return ResponseEntity.badRequest().body(ApiResponse.error(
            ex.getMessage() != null && !ex.getMessage().isBlank() ? ex.getMessage() : "Solicitud inválida"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneric(Exception ex) {
        log.error("Error inesperado", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiResponse.error("Error interno del servidor"));
    }
}

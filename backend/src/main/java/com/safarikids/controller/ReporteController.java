package com.safarikids.controller;

import com.safarikids.dto.ApiResponse;
import com.safarikids.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/reportes")
@RequiredArgsConstructor
public class ReporteController {

    private final ReservaRepository reservaRepo;
    private final VentaRepository ventaRepo;
    private final ClienteRepository clienteRepo;
    private final EmpleadoRepository empleadoRepo;
    private final ProductoRepository productoRepo;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> dashboard() {
        Map<String, Object> data = Map.of(
            "totalReservas",    reservaRepo.count(),
            "reservasPendientes", reservaRepo.countPendientes(),
            "totalClientes",    clienteRepo.count(),
            "totalEmpleados",   empleadoRepo.count(),
            "totalProductos",   productoRepo.count(),
            "totalVentas",      ventaRepo.count()
        );
        return ResponseEntity.ok(ApiResponse.ok(data));
    }
}

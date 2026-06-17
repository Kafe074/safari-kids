package com.safarikids.controller;

import com.safarikids.dto.ApiResponse;
import com.safarikids.model.*;
import com.safarikids.repository.*;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/solicitudes-insumos")
@RequiredArgsConstructor
public class SolicitudInsumoController {

    private final SolicitudInsumoRepository solicitudRepo;
    private final EmpleadoRepository empleadoRepo;
    private final InsumoRepository insumoRepo;
    private final ProductoRepository productoRepo;
    private final ClienteRepository clienteRepo;

    @Data
    public static class ItemDTO {
        private Integer idInsumo;
        private Integer idProducto;
        private Integer cantidad;
    }

    @Data
    public static class SolicitudDTO {
        private Integer idEmpleado;
        private Integer idCliente;
        private String observaciones;
        private List<ItemDTO> items;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SolicitudInsumo>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(solicitudRepo.findAllByOrderByFechaSolicitudDesc()));
    }

    @GetMapping("/empleado/{idEmpleado}")
    public ResponseEntity<ApiResponse<List<SolicitudInsumo>>> getByEmpleado(@PathVariable Integer idEmpleado) {
        return ResponseEntity.ok(ApiResponse.ok(
            solicitudRepo.findByEmpleadoIdEmpleadoOrderByFechaSolicitudDesc(idEmpleado)));
    }

    @PostMapping
    @Transactional
    public ResponseEntity<ApiResponse<SolicitudInsumo>> create(@RequestBody SolicitudDTO dto) {
        if (dto.getItems() == null || dto.getItems().isEmpty())
            return ResponseEntity.badRequest().body(ApiResponse.error("La solicitud debe incluir al menos un ítem"));

        Empleado empleado = empleadoRepo.findById(dto.getIdEmpleado()).orElse(null);
        if (empleado == null)
            return ResponseEntity.badRequest().body(ApiResponse.error("Empleado no encontrado"));

        if (dto.getIdCliente() == null)
            return ResponseEntity.badRequest().body(ApiResponse.error("Debes seleccionar el cliente para el que solicitas el kit"));
        Cliente cliente = clienteRepo.findById(dto.getIdCliente()).orElse(null);
        if (cliente == null)
            return ResponseEntity.badRequest().body(ApiResponse.error("Cliente no encontrado"));

        SolicitudInsumo solicitud = SolicitudInsumo.builder()
            .empleado(empleado)
            .cliente(cliente)
            .observaciones(dto.getObservaciones())
            .build();

        for (ItemDTO item : dto.getItems()) {
            int cantidad = item.getCantidad() == null || item.getCantidad() < 1 ? 1 : item.getCantidad();
            DetalleSolicitudInsumo det = DetalleSolicitudInsumo.builder()
                .solicitud(solicitud)
                .cantidad(cantidad)
                .build();
            if (item.getIdInsumo() != null) {
                Insumo insumo = insumoRepo.findById(item.getIdInsumo()).orElse(null);
                if (insumo == null)
                    return ResponseEntity.badRequest().body(ApiResponse.error("Insumo no encontrado: " + item.getIdInsumo()));
                det.setInsumo(insumo);
            } else if (item.getIdProducto() != null) {
                Producto producto = productoRepo.findById(item.getIdProducto()).orElse(null);
                if (producto == null)
                    return ResponseEntity.badRequest().body(ApiResponse.error("Producto no encontrado: " + item.getIdProducto()));
                det.setProducto(producto);
            } else {
                return ResponseEntity.badRequest().body(ApiResponse.error("Cada ítem debe tener un insumo o un producto"));
            }
            solicitud.getDetalles().add(det);
        }

        return ResponseEntity.ok(ApiResponse.ok("Solicitud enviada", solicitudRepo.save(solicitud)));
    }

    @PatchMapping("/{id}/estado")
    @Transactional
    public ResponseEntity<ApiResponse<SolicitudInsumo>> cambiarEstado(
            @PathVariable Integer id, @RequestParam String estado) {
        SolicitudInsumo solicitud = solicitudRepo.findById(id).orElse(null);
        if (solicitud == null) return ResponseEntity.notFound().build();

        SolicitudInsumo.EstadoSolicitud nuevo;
        try {
            nuevo = SolicitudInsumo.EstadoSolicitud.valueOf(estado);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Estado inválido: " + estado));
        }

        // Al entregar, descontar stock de los insumos solicitados
        if (nuevo == SolicitudInsumo.EstadoSolicitud.Entregada
                && solicitud.getEstado() != SolicitudInsumo.EstadoSolicitud.Entregada) {
            for (DetalleSolicitudInsumo det : solicitud.getDetalles()) {
                if (det.getInsumo() != null) {
                    Insumo insumo = det.getInsumo();
                    int stock = insumo.getStock() == null ? 0 : insumo.getStock();
                    insumo.setStock(Math.max(0, stock - det.getCantidad()));
                    insumoRepo.save(insumo);
                }
            }
        }

        solicitud.setEstado(nuevo);
        return ResponseEntity.ok(ApiResponse.ok("Estado actualizado", solicitudRepo.save(solicitud)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> cancelar(@PathVariable Integer id) {
        SolicitudInsumo solicitud = solicitudRepo.findById(id).orElse(null);
        if (solicitud == null) return ResponseEntity.notFound().build();
        if (solicitud.getEstado() != SolicitudInsumo.EstadoSolicitud.Pendiente)
            return ResponseEntity.badRequest().body(ApiResponse.error("Solo se pueden cancelar solicitudes pendientes"));
        solicitudRepo.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok("Solicitud cancelada", null));
    }
}
